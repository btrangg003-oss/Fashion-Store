import fs from 'fs/promises'
import path from 'path'
import { Address, AddressInput } from '../types/address'

const ADDRESSES_PATH = process.env.ADDRESSES_PATH || './data/addresses.json'

interface AddressData {
  addresses: Address[]
}

// Initialize database
const initializeDatabase = async (): Promise<void> => {
  try {
    await fs.access(ADDRESSES_PATH)
  } catch {
    const initialData: AddressData = { addresses: [] }
    const dir = path.dirname(ADDRESSES_PATH)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(ADDRESSES_PATH, JSON.stringify(initialData, null, 2))
  }
}

// Read database
const readDatabase = async (): Promise<AddressData> => {
  await initializeDatabase()
  try {
    const data = await fs.readFile(ADDRESSES_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading addresses:', error)
    return { addresses: [] }
  }
}

// Write database
const writeDatabase = async (data: AddressData): Promise<void> => {
  try {
    await fs.writeFile(ADDRESSES_PATH, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing addresses:', error)
    throw new Error('Failed to save addresses')
  }
}

// Generate address ID
const generateAddressId = (): string => {
  return `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Build full address string
const buildFullAddress = (input: AddressInput): string => {
  return `${input.street}, ${input.ward}, ${input.district}, ${input.province}`
}

// Get user addresses
export const getUserAddresses = async (userId: string): Promise<Address[]> => {
  const data = await readDatabase()
  return data.addresses.filter(addr => addr.userId === userId)
}

// Get address by ID
export const getAddressById = async (id: string): Promise<Address | null> => {
  const data = await readDatabase()
  return data.addresses.find(addr => addr.id === id) || null
}

// Create new address
export const createAddress = async (
  userId: string,
  input: AddressInput
): Promise<Address> => {
  const data = await readDatabase()
  
  // Check address limit (max 10 per user)
  const userAddresses = data.addresses.filter(addr => addr.userId === userId)
  if (userAddresses.length >= 10) {
    throw new Error('Bạn đã đạt giới hạn 10 địa chỉ')
  }
  
  // If this is the first address or isDefault is true, set as default
  const isDefault = userAddresses.length === 0 || input.isDefault === true
  
  // If setting as default, unset other defaults
  if (isDefault) {
    data.addresses = data.addresses.map(addr =>
      addr.userId === userId ? { ...addr, isDefault: false } : addr
    )
  }
  
  const newAddress: Address = {
    id: generateAddressId(),
    userId,
    type: input.type,
    label: input.label,
    fullName: input.fullName,
    phone: input.phone,
    province: input.province,
    provinceCode: input.provinceCode,
    district: input.district,
    districtCode: input.districtCode,
    ward: input.ward,
    wardCode: input.wardCode,
    street: input.street,
    fullAddress: buildFullAddress(input),
    isDefault,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  data.addresses.push(newAddress)
  await writeDatabase(data)
  
  return newAddress
}

// Update address
export const updateAddress = async (
  id: string,
  updates: Partial<AddressInput>
): Promise<Address | null> => {
  const data = await readDatabase()
  const index = data.addresses.findIndex(addr => addr.id === id)
  
  if (index === -1) {
    return null
  }
  
  const address = data.addresses[index]
  
  // Update fields
  const updated: Address = {
    ...address,
    ...updates,
    fullAddress: updates.street
      ? buildFullAddress({ ...address, ...updates } as AddressInput)
      : address.fullAddress,
    updatedAt: new Date().toISOString()
  }
  
  // If setting as default, unset other defaults
  if (updates.isDefault === true) {
    data.addresses = data.addresses.map(addr =>
      addr.userId === address.userId && addr.id !== id
        ? { ...addr, isDefault: false }
        : addr
    )
  }
  
  data.addresses[index] = updated
  await writeDatabase(data)
  
  return updated
}

// Delete address
export const deleteAddress = async (id: string): Promise<boolean> => {
  const data = await readDatabase()
  const address = data.addresses.find(addr => addr.id === id)
  
  if (!address) {
    return false
  }
  
  // Cannot delete default address if there are other addresses
  const userAddresses = data.addresses.filter(addr => addr.userId === address.userId)
  if (address.isDefault && userAddresses.length > 1) {
    throw new Error('Không thể xóa địa chỉ mặc định. Vui lòng đặt địa chỉ khác làm mặc định trước.')
  }
  
  data.addresses = data.addresses.filter(addr => addr.id !== id)
  await writeDatabase(data)
  
  return true
}

// Set default address
export const setDefaultAddress = async (
  userId: string,
  addressId: string
): Promise<boolean> => {
  const data = await readDatabase()
  
  // Check if address exists and belongs to user
  const address = data.addresses.find(
    addr => addr.id === addressId && addr.userId === userId
  )
  
  if (!address) {
    return false
  }
  
  // Unset all defaults for this user
  data.addresses = data.addresses.map(addr =>
    addr.userId === userId
      ? { ...addr, isDefault: addr.id === addressId }
      : addr
  )
  
  await writeDatabase(data)
  return true
}

// Get default address
export const getDefaultAddress = async (userId: string): Promise<Address | null> => {
  const data = await readDatabase()
  return data.addresses.find(addr => addr.userId === userId && addr.isDefault) || null
}

// Validate address input
export const validateAddressInput = (input: Partial<AddressInput>): string[] => {
  const errors: string[] = []
  
  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.push('Họ tên phải có ít nhất 2 ký tự')
  }
  
  if (!input.phone || !/^[0-9]{10,11}$/.test(input.phone)) {
    errors.push('Số điện thoại không hợp lệ (10-11 số)')
  }
  
  if (!input.province) {
    errors.push('Vui lòng chọn Tỉnh/Thành phố')
  }
  
  if (!input.district) {
    errors.push('Vui lòng chọn Quận/Huyện')
  }
  
  if (!input.ward) {
    errors.push('Vui lòng chọn Phường/Xã')
  }
  
  if (!input.street || input.street.trim().length < 10) {
    errors.push('Địa chỉ cụ thể phải có ít nhất 10 ký tự')
  }
  
  return errors
}
