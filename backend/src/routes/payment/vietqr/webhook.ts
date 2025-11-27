import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Webhook endpoint để nhận thông báo từ Suno VietQR
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📨 Received VietQR Webhook:', JSON.stringify(req.body, null, 2));

    // Lấy dữ liệu từ webhook
    const webhookData = req.body;

    // Suno VietQR webhook format:
    // {
    //   "id": "transaction_id",
    //   "gateway": "VIETQR",
    //   "transactionDate": "2024-01-01 10:00:00",
    //   "accountNumber": "1057925369",
    //   "subAccount": null,
    //   "transferType": "in",
    //   "transferAmount": 100000,
    //   "accumulated": 1000000,
    //   "code": null,
    //   "content": "FASHIONSTORE ORDER123",
    //   "referenceCode": "FT24001234567",
    //   "description": "Customer payment",
    //   "bankAccount": "1057925369",
    //   "bankSubAccount": null,
    //   "virtualAccount": null,
    //   "virtualAccountName": null,
    //   "counterAccountBankId": null,
    //   "counterAccountBankName": "MB Bank",
    //   "counterAccountName": "NGUYEN VAN A",
    //   "counterAccountNumber": "0123456789"
    // }

    const {
      id,
      transactionDate,
      transferAmount,
      content,
      referenceCode,
      counterAccountName,
      counterAccountNumber,
      counterAccountBankName
    } = webhookData;

    // Trích xuất order ID từ content
    // Format: "FASHIONSTORE ORDER123" hoặc "ORDER123"
    const orderIdMatch = content?.match(/ORDER[A-Z0-9]+/i) || content?.match(/FS[0-9]+/i);
    const orderId = orderIdMatch ? orderIdMatch[0] : null;

    if (!orderId) {
      console.log('⚠️ No order ID found in transaction content:', content);
      return res.status(200).json({ 
        success: true, 
        message: 'Received but no order ID found' 
      });
    }

    console.log(`✅ Found order ID: ${orderId}`);

    // Đọc orders database
    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    let ordersData = { orders: [] };
    
    if (fs.existsSync(ordersPath)) {
      const fileContent = fs.readFileSync(ordersPath, 'utf-8');
      ordersData = JSON.parse(fileContent);
    }

    // Tìm order
    const orderIndex = ordersData.orders.findIndex((o: any) => 
      o.orderNumber === orderId || o.id === orderId
    );

    if (orderIndex === -1) {
      console.log(`⚠️ Order not found: ${orderId}`);
      return res.status(200).json({ 
        success: true, 
        message: 'Order not found' 
      });
    }

    const order = ordersData.orders[orderIndex];

    // Kiểm tra số tiền
    const expectedAmount = order.total;
    const receivedAmount = transferAmount;

    if (receivedAmount < expectedAmount) {
      console.log(`⚠️ Amount mismatch: Expected ${expectedAmount}, Received ${receivedAmount}`);
      
      // Cập nhật order với thông tin thanh toán thiếu
      ordersData.orders[orderIndex] = {
        ...order,
        paymentStatus: 'partial',
        paymentInfo: {
          ...order.paymentInfo,
          transactionId: id,
          transactionDate,
          paidAmount: receivedAmount,
          expectedAmount,
          referenceCode,
          customerName: counterAccountName,
          customerAccount: counterAccountNumber,
          customerBank: counterAccountBankName,
          verifiedAt: new Date().toISOString()
        }
      };

      fs.writeFileSync(ordersPath, JSON.stringify(ordersData, null, 2));

      return res.status(200).json({
        success: true,
        message: 'Payment amount insufficient',
        orderId,
        expected: expectedAmount,
        received: receivedAmount
      });
    }

    // Cập nhật order status
    ordersData.orders[orderIndex] = {
      ...order,
      paymentStatus: 'paid',
      status: 'processing', // Chuyển sang processing sau khi thanh toán
      paymentInfo: {
        ...order.paymentInfo,
        transactionId: id,
        transactionDate,
        paidAmount: receivedAmount,
        referenceCode,
        customerName: counterAccountName,
        customerAccount: counterAccountNumber,
        customerBank: counterAccountBankName,
        verifiedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };

    // Lưu lại
    fs.writeFileSync(ordersPath, JSON.stringify(ordersData, null, 2));

    console.log(`✅ Order ${orderId} marked as PAID`);

    // TODO: Gửi email xác nhận thanh toán cho khách hàng
    // TODO: Gửi thông báo cho admin

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      orderId,
      amount: receivedAmount,
      transactionId: id
    });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
