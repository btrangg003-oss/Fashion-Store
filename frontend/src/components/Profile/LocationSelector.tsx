import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Province, District, Ward } from '@/models/address'

const Container = styled.div`
  display: grid;
  gap: 16px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
`

const Select = styled.select`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`

interface LocationSelectorProps {
  provinceCode?: string
  districtCode?: string
  wardCode?: string
  onChange: (location: {
    province: string
    provinceCode: string
    district: string
    districtCode: string
    ward: string
    wardCode: string
  }) => void
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  provinceCode: initialProvinceCode,
  districtCode: initialDistrictCode,
  wardCode: initialWardCode,
  onChange
}) => {
  const [selectedProvince, setSelectedProvince] = useState(initialProvinceCode || '')
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrictCode || '')
  const [selectedWard, setSelectedWard] = useState(initialWardCode || '')
  
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  
  const [loading, setLoading] = useState(false)

  // Load provinces on mount
  useEffect(() => {
    fetchProvinces()
  }, [])

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      fetchDistricts(selectedProvince)
      
      // Reset district and ward if province changed
      if (selectedProvince !== initialProvinceCode) {
        setSelectedDistrict('')
        setSelectedWard('')
        setWards([])
      }
    } else {
      setDistricts([])
      setSelectedDistrict('')
      setSelectedWard('')
      setWards([])
    }
  }, [selectedProvince])

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      fetchWards(selectedDistrict)
      
      // Reset ward if district changed
      if (selectedDistrict !== initialDistrictCode) {
        setSelectedWard('')
      }
    } else {
      setWards([])
      setSelectedWard('')
    }
  }, [selectedDistrict])

  const fetchProvinces = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/locations/provinces')
      const data = await response.json()
      setProvinces(data.provinces)
    } catch (error) {
      console.error('Fetch provinces error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDistricts = async (provinceCode: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/locations/districts?provinceCode=${provinceCode}`)
      const data = await response.json()
      setDistricts(data.districts)
    } catch (error) {
      console.error('Fetch districts error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWards = async (districtCode: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/locations/wards?districtCode=${districtCode}`)
      const data = await response.json()
      setWards(data.wards)
    } catch (error) {
      console.error('Fetch wards error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Notify parent when all selections are complete
  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard) {
      const province = provinces.find(p => p.code === selectedProvince)
      const district = districts.find(d => d.code === selectedDistrict)
      const ward = wards.find(w => w.code === selectedWard)

      if (province && district && ward) {
        onChange({
          province: province.name,
          provinceCode: province.code,
          district: district.name,
          districtCode: district.code,
          ward: ward.name,
          wardCode: ward.code
        })
      }
    }
  }, [selectedProvince, selectedDistrict, selectedWard])

  return (
    <Container>
      <FormGroup>
        <Label>Tỉnh/Thành phố *</Label>
        <Select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          disabled={loading}
        >
          <option value="">
            {loading && !provinces.length ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}
          </option>
          {provinces.map(province => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>Quận/Huyện *</Label>
        <Select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          disabled={!selectedProvince || loading}
        >
          <option value="">
            {loading && selectedProvince ? 'Đang tải...' : 'Chọn quận/huyện'}
          </option>
          {districts.map(district => (
            <option key={district.code} value={district.code}>
              {district.name}
            </option>
          ))}
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>Phường/Xã *</Label>
        <Select
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          disabled={!selectedDistrict || loading}
        >
          <option value="">
            {loading && selectedDistrict ? 'Đang tải...' : 'Chọn phường/xã'}
          </option>
          {wards.map(ward => (
            <option key={ward.code} value={ward.code}>
              {ward.name}
            </option>
          ))}
        </Select>
      </FormGroup>
    </Container>
  )
}

export default LocationSelector
