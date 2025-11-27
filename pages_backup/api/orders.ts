import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../lib/auth'
import { getAllOrders, getUserOrders, createOrder, getOrderById } from '../../lib/ordersDatabase'
import { queueOrderConfirmationEmail, queueAdminNewOrderEmail } from '../../lib/emailQueue'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle GET requests
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  // Handle POST requests (create order)
  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { orderId } = req.query;

  // If orderId is provided, return specific order (no auth required for checkout success page)
  if (orderId) {
    try {
      const order = await getOrderById(orderId as string);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.status(200).json(order);
    } catch (error) {
      console.error('Get order error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // List orders
  try {
    const token = req.cookies.token

    // If no token, return all orders (for admin testing)
    if (!token) {
      console.log('No token - returning all orders for admin');
      const orders = await getAllOrders();
      return res.status(200).json({
        success: true,
        orders: orders,
        data: orders
      });
    }

    // If has token, verify and return appropriate orders
    const decoded = verifyToken(token) as any

    if (!decoded) {
      // Invalid token, but still return all orders for admin
      const orders = await getAllOrders();
      return res.status(200).json({
        success: true,
        orders: orders,
        data: orders
      });
    }

    const isAdmin = decoded.email === process.env.ADMIN_EMAIL ||
      decoded.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

    let orders
    if (isAdmin) {
      orders = await getAllOrders()
    } else {
      orders = await getUserOrders(decoded.id)
    }

    return res.status(200).json({
      success: true,
      orders: orders,
      data: orders
    })

  } catch (error) {
    console.error('Orders API error:', error)
    // On error, still try to return all orders
    try {
      const orders = await getAllOrders();
      return res.status(200).json({
        success: true,
        orders: orders,
        data: orders
      });
    } catch (e) {
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      orderId,
      shippingInfo,
      shippingMethod,
      items,
      subtotal,
      total,
      paymentMethod,
      paymentStatus
    } = req.body;

    // Validate required fields
    if (!orderId || !shippingInfo || !shippingMethod || !items || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user info if authenticated
    let userId = null;
    let userEmail = null;
    const token = req.cookies.token;
    if (token) {
      const decoded = verifyToken(token) as any;
      if (decoded) {
        userId = decoded.id;
        userEmail = decoded.email;
      }
    }

    // Create order
    // ✅ Ưu tiên email trong form checkout
    const customerEmail = shippingInfo.email || userEmail;
    const order = await createOrder({
      orderId,
      orderNumber: orderId, // For admin compatibility
      userId,
      customerEmail: customerEmail,
      customerName: shippingInfo.fullName,
      customerPhone: shippingInfo.phone,
      shippingAddress: {
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        ward: shippingInfo.ward,
        district: shippingInfo.district,
        city: shippingInfo.city
      },
      shippingMethod: {
        name: shippingMethod.name,
        price: shippingMethod.price,
        estimatedDays: shippingMethod.estimatedDays
      },
      items,
      subtotal,
      shipping: shippingMethod.price, // For admin compatibility
      shippingFee: shippingMethod.price,
      total,
      paymentMethod,
      paymentStatus: paymentStatus || 'pending',
      status: 'pending', // For admin compatibility
      orderStatus: 'pending',
      notes: shippingInfo.note || '',
      note: shippingInfo.note || '',
      createdAt: new Date().toISOString()
    });

    // Send order confirmation email to customer with FULL details
    try {
      await queueOrderConfirmationEmail({
        email: customerEmail,
        firstName: shippingInfo.fullName.split(' ')[0],
        orderNumber: orderId,
        total: total,
        subtotal: subtotal,
        discount: 0, // TODO: Add discount calculation if needed
        shipping: shippingMethod.price,
        items: items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image || item.imageUrl || null
        })),
        shippingAddress: {
          fullName: shippingInfo.fullName,
          phone: shippingInfo.phone,
          email: customerEmail,
          address: shippingInfo.address,
          ward: shippingInfo.ward,
          district: shippingInfo.district,
          city: shippingInfo.city
        },
        shippingMethod: shippingMethod.name || 'standard',
        paymentMethod: paymentMethod
      });
      console.log('✅ Order confirmation email queued for customer:', customerEmail);
    } catch (emailError) {
      console.error('❌ Failed to queue customer email:', emailError);
      // Don't fail the order creation if email fails
    }

    // Send new order notification to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (adminEmail) {
        await queueAdminNewOrderEmail({
          adminEmail: adminEmail,
          orderNumber: orderId,
          total: total,
          userEmail: customerEmail, // ✅ Dùng email từ form checkout
          customerName: shippingInfo.fullName,
          items: items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image || item.imageUrl || null
          })),
          shippingAddress: {
            phone: shippingInfo.phone,
            address: `${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.city}`
          }
        });
        console.log('✅ Admin notification email queued:', adminEmail);
      }
    } catch (emailError) {
      console.error('❌ Failed to queue admin email:', emailError);
      // Don't fail the order creation if email fails
    }

    return res.status(201).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}