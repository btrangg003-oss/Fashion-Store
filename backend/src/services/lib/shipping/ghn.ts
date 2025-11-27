// GHN (Giao Hàng Nhanh) API Integration
// Documentation: https://api.ghn.vn/home/docs/detail

interface GHNConfig {
  token: string;
  shopId: number;
  apiUrl: string;
}

interface GHNAddress {
  provinceId: number;
  provinceName?: string;
  districtId: number;
  districtName?: string;
  wardCode: string;
  wardName?: string;
}

interface GHNCalculateFeeParams {
  fromDistrictId: number;
  toDistrictId: number;
  toWardCode: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  serviceTypeId: number;
  insuranceValue?: number;
  coupon?: string;
}

interface GHNCreateOrderParams {
  paymentTypeId: number; // 1: Người gửi trả, 2: Người nhận trả (COD)
  note?: string;
  requiredNote: string; // CHOTHUHANG, CHOXEMHANGKHONGTHU, KHONGCHOXEMHANG
  fromName: string;
  fromPhone: string;
  fromAddress: string;
  fromWardName: string;
  fromDistrictName: string;
  fromProvinceName: string;
  returnName: string;
  returnPhone: string;
  returnAddress: string;
  returnWardName: string;
  returnDistrictName: string;
  returnProvinceName: string;
  toName: string;
  toPhone: string;
  toAddress: string;
  toWardCode: string;
  toDistrictId: number;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  serviceTypeId: number;
  serviceId: number;
  items: Array<{
    name: string;
    code?: string;
    quantity: number;
    price?: number;
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
  }>;
  codAmount?: number;
  insuranceValue?: number;
  coupon?: string;
}

interface GHNOrderResponse {
  code: number;
  message: string;
  data: {
    order_code: string;
    sort_code: string;
    trans_type: string;
    ward_encode: string;
    district_encode: string;
    fee: {
      main_service: number;
      insurance: number;
      cod_fee: number;
      station_do: number;
      station_pu: number;
      return: number;
      r2s: number;
      coupon: number;
      total: number;
    };
    total_fee: number;
    expected_delivery_time: string;
  };
}

interface GHNTrackingResponse {
  code: number;
  message: string;
  data: {
    order_code: string;
    status: string;
    status_name: string;
    current_warehouse: string;
    current_status: string;
    expected_delivery_time: string;
    log: Array<{
      status: string;
      updated_date: string;
      location: string;
    }>;
  };
}

export class GHNService {
  private config: GHNConfig;

  constructor() {
    this.config = {
      token: process.env.GHN_TOKEN || '',
      shopId: parseInt(process.env.GHN_SHOP_ID || '0'),
      apiUrl: process.env.GHN_API_URL || 'https://dev-online-gateway.ghn.vn/shiip/public-api'
    };
  }

  private async request(endpoint: string, method: string = 'GET', data?: any) {
    const url = `${this.config.apiUrl}${endpoint}`;
    
    const headers: any = {
      'Content-Type': 'application/json',
      'Token': this.config.token
    };

    if (this.config.shopId) {
      headers['ShopId'] = this.config.shopId.toString();
    }

    const options: RequestInit = {
      method,
      headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || 'GHN API Error');
      }

      return result;
    } catch (error: any) {
      console.error('GHN API Error:', error);
      throw new Error(error.message || 'Failed to connect to GHN');
    }
  }

  // Get provinces
  async getProvinces() {
    return this.request('/master-data/province');
  }

  // Get districts by province
  async getDistricts(provinceId: number) {
    return this.request('/master-data/district', 'POST', { province_id: provinceId });
  }

  // Get wards by district
  async getWards(districtId: number) {
    return this.request('/master-data/ward', 'POST', { district_id: districtId });
  }

  // Get available services
  async getServices(fromDistrictId: number, toDistrictId: number) {
    return this.request('/v2/shipping-order/available-services', 'POST', {
      shop_id: this.config.shopId,
      from_district: fromDistrictId,
      to_district: toDistrictId
    });
  }

  // Calculate shipping fee
  async calculateFee(params: GHNCalculateFeeParams) {
    const data = {
      service_type_id: params.serviceTypeId,
      from_district_id: params.fromDistrictId,
      to_district_id: params.toDistrictId,
      to_ward_code: params.toWardCode,
      weight: params.weight,
      length: params.length,
      width: params.width,
      height: params.height,
      insurance_value: params.insuranceValue,
      coupon: params.coupon
    };

    const result = await this.request('/v2/shipping-order/fee', 'POST', data);
    return result.data;
  }

  // Create shipping order
  async createOrder(params: GHNCreateOrderParams): Promise<GHNOrderResponse> {
    const data = {
      payment_type_id: params.paymentTypeId,
      note: params.note,
      required_note: params.requiredNote,
      from_name: params.fromName,
      from_phone: params.fromPhone,
      from_address: params.fromAddress,
      from_ward_name: params.fromWardName,
      from_district_name: params.fromDistrictName,
      from_province_name: params.fromProvinceName,
      return_name: params.returnName,
      return_phone: params.returnPhone,
      return_address: params.returnAddress,
      return_ward_name: params.returnWardName,
      return_district_name: params.returnDistrictName,
      return_province_name: params.returnProvinceName,
      to_name: params.toName,
      to_phone: params.toPhone,
      to_address: params.toAddress,
      to_ward_code: params.toWardCode,
      to_district_id: params.toDistrictId,
      weight: params.weight,
      length: params.length,
      width: params.width,
      height: params.height,
      service_type_id: params.serviceTypeId,
      service_id: params.serviceId,
      items: params.items,
      cod_amount: params.codAmount,
      insurance_value: params.insuranceValue,
      coupon: params.coupon
    };

    return this.request('/v2/shipping-order/create', 'POST', data);
  }

  // Get order tracking
  async getTracking(orderCode: string): Promise<GHNTrackingResponse> {
    return this.request('/v2/shipping-order/detail', 'POST', {
      order_code: orderCode
    });
  }

  // Cancel order
  async cancelOrder(orderCodes: string[]) {
    return this.request('/v2/switch-status/cancel', 'POST', {
      order_codes: orderCodes
    });
  }

  // Print order
  async printOrder(orderCodes: string[]) {
    return this.request('/v2/a5/gen-token', 'POST', {
      order_codes: orderCodes
    });
  }

  // Get shipping label URL
  getShippingLabelUrl(token: string): string {
    return `https://dev-online-gateway.ghn.vn/a5/public-api/printA5?token=${token}`;
  }

  // Helper: Parse address to get district and ward codes
  async parseAddress(address: {
    province: string;
    district: string;
    ward: string;
  }): Promise<{ districtId: number; wardCode: string } | null> {
    try {
      // Get provinces
      const provincesResult = await this.getProvinces();
      const province = provincesResult.data.find((p: any) => 
        p.ProvinceName.toLowerCase().includes(address.province.toLowerCase())
      );

      if (!province) return null;

      // Get districts
      const districtsResult = await this.getDistricts(province.ProvinceID);
      const district = districtsResult.data.find((d: any) => 
        d.DistrictName.toLowerCase().includes(address.district.toLowerCase())
      );

      if (!district) return null;

      // Get wards
      const wardsResult = await this.getWards(district.DistrictID);
      const ward = wardsResult.data.find((w: any) => 
        w.WardName.toLowerCase().includes(address.ward.toLowerCase())
      );

      if (!ward) return null;

      return {
        districtId: district.DistrictID,
        wardCode: ward.WardCode
      };
    } catch (error) {
      console.error('Parse address error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const ghnService = new GHNService();
