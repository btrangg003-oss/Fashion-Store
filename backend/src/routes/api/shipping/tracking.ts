import type { NextApiRequest, NextApiResponse } from 'next';
import { ghnService } from '@/services/shipping/ghn';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { orderCode } = req.query;

    if (!orderCode) {
      return res.status(400).json({
        message: 'Missing orderCode parameter'
      });
    }

    // Get tracking info from GHN
    const result = await ghnService.getTracking(orderCode as string);

    if (result.code !== 200) {
      return res.status(404).json({
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Map status to Vietnamese
    const statusMap: any = {
      'ready_to_pick': 'Chờ lấy hàng',
      'picking': 'Đang lấy hàng',
      'cancel': 'Đã hủy',
      'money_collect_picking': 'Đang thu tiền người gửi',
      'picked': 'Đã lấy hàng',
      'storing': 'Nhập kho',
      'transporting': 'Đang vận chuyển',
      'sorting': 'Đang phân loại',
      'delivering': 'Đang giao hàng',
      'money_collect_delivering': 'Đang thu tiền người nhận',
      'delivered': 'Đã giao hàng',
      'delivery_fail': 'Giao hàng thất bại',
      'waiting_to_return': 'Chờ trả hàng',
      'return': 'Trả hàng',
      'return_transporting': 'Đang vận chuyển trả',
      'return_sorting': 'Đang phân loại trả',
      'returning': 'Đang trả hàng',
      'return_fail': 'Trả hàng thất bại',
      'returned': 'Đã trả hàng',
      'exception': 'Đơn hàng ngoại lệ',
      'damage': 'Hàng bị hư hỏng',
      'lost': 'Hàng bị thất lạc'
    };

    const tracking = {
      orderCode: result.data.order_code,
      status: result.data.status,
      statusName: statusMap[result.data.status] || result.data.status_name,
      currentLocation: result.data.current_warehouse,
      currentStatus: result.data.current_status,
      expectedDelivery: result.data.expected_delivery_time,
      timeline: result.data.log.map((log: any) => ({
        status: statusMap[log.status] || log.status,
        time: log.updated_date,
        location: log.location
      }))
    };

    return res.status(200).json({
      success: true,
      tracking
    });

  } catch (error: any) {
    console.error('Tracking error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error'
    });
  }
}
