import type { NextApiRequest, NextApiResponse } from 'next';
import { ghnService } from '@/services/shipping/ghn';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      toProvince,
      toDistrict,
      toWard,
      weight,
      length,
      width,
      height,
      insuranceValue,
      serviceType = 2 // 2: E-commerce standard
    } = req.body;

    // Validate required fields
    if (!toProvince || !toDistrict || !toWard || !weight) {
      return res.status(400).json({
        message: 'Missing required fields: toProvince, toDistrict, toWard, weight'
      });
    }

    // Parse address to get district and ward codes
    const addressInfo = await ghnService.parseAddress({
      province: toProvince,
      district: toDistrict,
      ward: toWard
    });

    if (!addressInfo) {
      return res.status(400).json({
        message: 'Không tìm thấy địa chỉ. Vui lòng kiểm tra lại Tỉnh/Thành, Quận/Huyện, Phường/Xã'
      });
    }

    // Get shop's district (from env or default)
    const fromDistrictId = parseInt(process.env.GHN_FROM_DISTRICT_ID || '1442'); // Default: Q1, HCM

    // Get available services
    const servicesResult = await ghnService.getServices(fromDistrictId, addressInfo.districtId);
    
    if (!servicesResult.data || servicesResult.data.length === 0) {
      return res.status(400).json({
        message: 'Không có dịch vụ vận chuyển khả dụng cho địa chỉ này'
      });
    }

    // Calculate fee for each service
    const fees = await Promise.all(
      servicesResult.data.map(async (service: any) => {
        try {
          const feeData = await ghnService.calculateFee({
            fromDistrictId,
            toDistrictId: addressInfo.districtId,
            toWardCode: addressInfo.wardCode,
            weight: weight,
            length: length,
            width: width,
            height: height,
            serviceTypeId: service.service_type_id,
            insuranceValue: insuranceValue
          });

          return {
            serviceId: service.service_id,
            serviceTypeId: service.service_type_id,
            serviceName: service.short_name,
            fee: feeData.total,
            expectedDeliveryTime: feeData.expected_delivery_time,
            breakdown: {
              mainService: feeData.service_fee,
              insurance: feeData.insurance_fee,
              codFee: feeData.coupon_value || 0,
              other: feeData.r2s_fee || 0
            }
          };
        } catch (error) {
          console.error(`Error calculating fee for service ${service.service_id}:`, error);
          return null;
        }
      })
    );

    // Filter out failed calculations
    const validFees = fees.filter(f => f !== null);

    if (validFees.length === 0) {
      return res.status(500).json({
        message: 'Không thể tính phí vận chuyển. Vui lòng thử lại sau'
      });
    }

    // Sort by fee (cheapest first)
    validFees.sort((a, b) => a!.fee - b!.fee);

    return res.status(200).json({
      success: true,
      services: validFees,
      recommended: validFees[0], // Cheapest option
      addressInfo: {
        districtId: addressInfo.districtId,
        wardCode: addressInfo.wardCode
      }
    });

  } catch (error: any) {
    console.error('Calculate shipping fee error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error'
    });
  }
}
