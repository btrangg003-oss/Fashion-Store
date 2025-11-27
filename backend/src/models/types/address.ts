export interface Address {
  id: string
  userId: string
  type: 'home' | 'office' | 'other'
  label?: string
  
  // Contact info
  fullName: string
  phone: string
  
  // Location
  province: string
  provinceCode: string
  district: string
  districtCode: string
  ward: string
  wardCode: string
  street: string
  
  // Full address
  fullAddress: string
  
  // Status
  isDefault: boolean
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface AddressInput {
  type: 'home' | 'office' | 'other'
  label?: string
  fullName: string
  phone: string
  province: string
  provinceCode: string
  district: string
  districtCode: string
  ward: string
  wardCode: string
  street: string
  isDefault?: boolean
}

export interface Province {
  code: string
  name: string
}

export interface District {
  code: string
  name: string
  provinceCode: string
}

export interface Ward {
  code: string
  name: string
  districtCode: string
}

export interface LocationData {
  provinces: Province[]
  districts: District[]
  wards: Ward[]
}
