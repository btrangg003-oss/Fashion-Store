import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { JWTPayload } from '@/models/auth';
import { ghnService } from '@/services/shipping/ghn';
import { getMovementById, updateMovement } from '@/services/inventoryDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token) as JWTPayload;
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const {
      outboundId,
      serviceId,
      serviceTypeId,
      weight,
      dimensions,
      requiredNote = 'KHONGCHOXEMHANG',
      note
    } = req.body;

    // Validate
    if (!outboundId || !serviceId || !serviceTypeId || !weight) {
      return res.status(400).json({
        message: 'Missing required fields'
      });
    }

    // Get outbound movement
    const movement = getMovementById(outboundId);
    if (!movement) {
      return res.status(404).json({ message: 'Outbound not found' });
    }

    // Check if shipping order already exists
    if (movement.shippingOrderCode) {
      return res.status(400).json({
        message: 'Đơn vận chuyển đã tồn tại',
        orderCode: movement.shippingOrderCode
      });
    }

    // Validate customer info
    if (!movement.customerName || !movement.customerPhone || !movement.customerAddress) {
      return res.status(400).json({
        message: 'Thiếu thông tin khách hàng'
      });
    }

    // Parse customer address
    const addressParts = movement.customerAddress.split(',').map(s => s.trim());
    if (addressParts.length < 4) {
      return res.status(400).json({
        message: 'Địa chỉ không đúng định dạng. Cần: Địa chỉ, Phường/Xã, Quận/Huyện, Tỉnh/Thành'
      });
    }

    const [address, ward, district, province] = addressParts;

    // Parse address to get codes
    const addressInfo = await ghnService.parseAddress({
      province,
      district,
      ward
    });

    if (!addressInfo) {
      return res.status(400).json({
        message: 'Không tìm thấy địa chỉ trong hệ thống GHN'
      });
    }

    // Get shop info from env
    const shopInfo = {
      name: process.env.GHN_SHOP_NAME || 'Fashion Store',
      phone: process.env.GHN_SHOP_PHONE || '0901234567',
      address: process.env.GHN_SHOP_ADDRESS || '123 Nguyễn Huệ',
      ward: process.env.GHN_SHOP_WARD || 'Bến Nghé',
      district: process.env.GHN_SHOP_DISTRICT || 'Quận 1',
      province: process.env.GHN_SHOP_PROVINCE || 'Hồ Chí Minh'
    };

    // Prepare items
    const items = movement.items.map(item => ({
      name: item.name,
      code: item.sku,
      quantity: item.quantity,
      price: item.totalValue / item.quantity
    }));

    // Calculate COD amount
    const codAmount = movement.paymentMethod.includes('cod') ? movement.debtAmount : 0;

    // Create shipping order
    const result = await ghnService.createOrder({
      paymentTypeId: codAmount > 0 ? 2 : 1, // 1: Người gửi trả, 2: COD
      note: note || movement.notes,
      requiredNote,
      
      // From (Shop)
      fromName: shopInfo.name,
      fromPhone: shopInfo.phone,
      fromAddress: shopInfo.address,
      fromWardName: shopInfo.ward,
      fromDistrictName: shopInfo.district,
      fromProvinceName: shopInfo.province,
      
      // Return (Shop)
      returnName: shopInfo.name,
      returnPhone: shopInfo.phone,
      returnAddress: shopInfo.address,
      returnWardName: shopInfo.ward,
      returnDistrictName: shopInfo.district,
      returnProvinceName: shopInfo.province,
      
      // To (Customer)
      toName: movement.customerName,
      toPhone: movement.customerPhone,
      toAddress: address,
      toWardCode: addressInfo.wardCode,
      toDistrictId: addressInfo.districtId,
      
      // Package info
      weight,
      length: dimensions?.length,
      width: dimensions?.width,
      height: dimensions?.height,
      
      // Service
      serviceTypeId,
      serviceId,
      
      // Items
      items,
      
      // Payment
      codAmount,
      insuranceValue: movement.totalValue
    });

    if (result.code !== 200) {
      return res.status(400).json({
        message: result.message || 'Không thể tạo đơn vận chuyển'
      });
    }

    // Update movement with shipping info
    updateMovement(outboundId, {
      shippingCarrier: 'ghn',
      shippingOrderCode: result.data.order_code,
      shippingFee: result.data.total_fee,
      shippingExpectedDelivery: result.data.expected_delivery_time,
      shippingCreatedAt: new Date().toISOString(),
      history: [
        ...movement.history,
        {
          action: 'Tạo đơn vận chuyển',
          by: decoded.userId,
          byName: decoded.firstName + ' ' + decoded.lastName,
          at: new Date().toISOString(),
          note: `GHN Order: ${result.data.order_code}`
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo đơn vận chuyển thành công',
      shipping: {
        carrier: 'ghn',
        orderCode: result.data.order_code,
        sortCode: result.data.sort_code,
        fee: result.data.total_fee,
        expectedDelivery: result.data.expected_delivery_time
      }
    });

  } catch (error: any) {
    console.error('Create shipping order error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error'
    });
  }
}
