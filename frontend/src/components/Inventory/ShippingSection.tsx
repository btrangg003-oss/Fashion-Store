import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface ShippingSectionProps {
  outboundId: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  weight?: number;
  onShippingCreated?: (shippingInfo: any) => void;
}

interface ShippingService {
  serviceId: number;
  serviceTypeId: number;
  serviceName: string;
  fee: number;
  expectedDeliveryTime: string;
  breakdown: {
    mainService: number;
    insurance: number;
    codFee: number;
    other: number;
  };
}

const ShippingSection: React.FC<ShippingSectionProps> = ({
  outboundId,
  customerName,
  customerPhone,
  customerAddress,
  weight: initialWeight = 500,
  onShippingCreated
}) => {
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [services, setServices] = useState<ShippingService[]>([]);
  const [selectedService, setSelectedService] = useState<ShippingService | null>(null);
  const [shippingInfo, setShippingInfo] = useState<any>(null);
  const [error, setError] = useState('');
  
  // Form state
  const [weight, setWeight] = useState(initialWeight);
  const [length, setLength] = useState(20);
  const [width, setWidth] = useState(15);
  const [height, setHeight] = useState(10);
  const [insuranceValue, setInsuranceValue] = useState(0);
  const [note, setNote] = useState('');
  const [requiredNote, setRequiredNote] = useState<'CHOTHUHANG' | 'CHOXEMHANGKHONGTHU' | 'KHONGCHOXEMHANG'>('KHONGCHOXEMHANG');

  // Parse address to get province, district, ward
  const parseAddress = (address: string) => {
    if (!address) return { province: '', district: '', ward: '' };
    
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 3) {
      return {
        ward: parts[parts.length - 3] || '',
        district: parts[parts.length - 2] || '',
        province: parts[parts.length - 1] || ''
      };
    }
    return { province: '', district: '', ward: '' };
  };

  const handleCalculateFee = async () => {
    if (!customerAddress) {
      setError('Thiếu địa chỉ giao hàng');
      return;
    }

    setCalculating(true);
    setError('');
    
    try {
      const { province, district, ward } = parseAddress(customerAddress);
      
      const response = await fetch('/api/shipping/calculate-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toProvince: province,
          toDistrict: district,
          toWard: ward,
          weight,
          length,
          width,
          height,
          insuranceValue
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setServices(data.services || []);
        if (data.recommended) {
          setSelectedService(data.recommended);
        }
      } else {
        setError(data.message || 'Không thể tính phí vận chuyển');
      }
    } catch (err) {
      setError('Lỗi khi tính phí vận chuyển');
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const handleCreateShipping = async () => {
    if (!selectedService) {
      setError('Vui lòng chọn dịch vụ vận chuyển');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/shipping/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          outboundId,
          serviceId: selectedService.serviceId,
          serviceTypeId: selectedService.serviceTypeId,
          weight,
          dimensions: { length, width, height },
          insuranceValue,
          requiredNote,
          note
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setShippingInfo(data.shipping);
        if (onShippingCreated) {
          onShippingCreated(data.shipping);
        }
      } else {
        setError(data.message || 'Không thể tạo đơn vận chuyển');
      }
    } catch (err) {
      setError('Lỗi khi tạo đơn vận chuyển');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTracking = async () => {
    if (!shippingInfo?.orderCode) return;
    
    try {
      const response = await fetch(`/api/shipping/tracking?orderCode=${shippingInfo.orderCode}`);
      const data = await response.json();
      
      if (data.success) {
        // Show tracking modal or navigate to tracking page
        alert(`Trạng thái: ${data.tracking.statusName}\nVị trí: ${data.tracking.currentLocation}`);
      }
    } catch (err) {
      console.error('Tracking error:', err);
    }
  };

  const handlePrintLabel = () => {
    if (!shippingInfo?.orderCode) return;
    // Open GHN print label page
    window.open(`https://5sao.ghn.dev/order/print?ids=${shippingInfo.orderCode}`, '_blank');
  };

  return (
    <Container>
      <Header>
        <Title>🚚 Vận Chuyển</Title>
        <Logo src="/ghn-logo.png" alt="GHN" onError={(e) => e.currentTarget.style.display = 'none'} />
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!shippingInfo ? (
        <>
          <CustomerInfo>
            <InfoRow>
              <Label>Khách hàng:</Label>
              <Value>{customerName || 'Chưa có thông tin'}</Value>
            </InfoRow>
            <InfoRow>
              <Label>Số điện thoại:</Label>
              <Value>{customerPhone || 'Chưa có thông tin'}</Value>
            </InfoRow>
            <InfoRow>
              <Label>Địa chỉ:</Label>
              <Value>{customerAddress || 'Chưa có thông tin'}</Value>
            </InfoRow>
          </CustomerInfo>

          <PackageInfo>
            <SectionTitle>📦 Thông Tin Kiện Hàng</SectionTitle>
            
            <FormGrid>
              <FormGroup>
                <FormLabel>Khối lượng (gram)</FormLabel>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  min="1"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Dài (cm)</FormLabel>
                <Input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  min="1"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Rộng (cm)</FormLabel>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  min="1"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Cao (cm)</FormLabel>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min="1"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Giá trị bảo hiểm (₫)</FormLabel>
                <Input
                  type="number"
                  value={insuranceValue}
                  onChange={(e) => setInsuranceValue(Number(e.target.value))}
                  min="0"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Lưu ý giao hàng</FormLabel>
                <Select
                  value={requiredNote}
                  onChange={(e) => setRequiredNote(e.target.value as any)}
                >
                  <option value="CHOTHUHANG">Cho thử hàng</option>
                  <option value="CHOXEMHANGKHONGTHU">Cho xem hàng không thử</option>
                  <option value="KHONGCHOXEMHANG">Không cho xem hàng</option>
                </Select>
              </FormGroup>
            </FormGrid>

            <FormGroup>
              <FormLabel>Ghi chú</FormLabel>
              <TextArea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú cho shipper..."
                rows={2}
              />
            </FormGroup>

            <CalculateButton
              onClick={handleCalculateFee}
              disabled={calculating || !customerAddress}
            >
              {calculating ? '⏳ Đang tính...' : '💰 Tính Phí Vận Chuyển'}
            </CalculateButton>
          </PackageInfo>

          {services.length > 0 && (
            <ServicesSection>
              <SectionTitle>📋 Dịch Vụ Vận Chuyển</SectionTitle>
              <ServicesList>
                {services.map((service) => (
                  <ServiceCard
                    key={service.serviceId}
                    selected={selectedService?.serviceId === service.serviceId}
                    onClick={() => setSelectedService(service)}
                  >
                    <ServiceHeader>
                      <ServiceName>{service.serviceName}</ServiceName>
                      <ServiceFee>{service.fee.toLocaleString()}₫</ServiceFee>
                    </ServiceHeader>
                    <ServiceDetails>
                      <DeliveryTime>
                        ⏰ Dự kiến: {new Date(service.expectedDeliveryTime).toLocaleDateString('vi-VN')}
                      </DeliveryTime>
                    </ServiceDetails>
                    {selectedService?.serviceId === service.serviceId && (
                      <SelectedBadge>✓ Đã chọn</SelectedBadge>
                    )}
                  </ServiceCard>
                ))}
              </ServicesList>

              <CreateButton
                onClick={handleCreateShipping}
                disabled={loading || !selectedService}
              >
                {loading ? '⏳ Đang tạo...' : '🚚 Tạo Đơn Vận Chuyển'}
              </CreateButton>
            </ServicesSection>
          )}
        </>
      ) : (
        <ShippingDetails>
          <SectionTitle>✅ Đã Tạo Đơn Vận Chuyển</SectionTitle>
          
          <DetailGrid>
            <DetailRow>
              <DetailLabel>Mã vận đơn:</DetailLabel>
              <DetailValue>
                <OrderCode>{shippingInfo.orderCode}</OrderCode>
              </DetailValue>
            </DetailRow>

            {shippingInfo.sortCode && (
              <DetailRow>
                <DetailLabel>Mã phân loại:</DetailLabel>
                <DetailValue>{shippingInfo.sortCode}</DetailValue>
              </DetailRow>
            )}

            <DetailRow>
              <DetailLabel>Phí vận chuyển:</DetailLabel>
              <DetailValue>
                <Fee>{shippingInfo.fee?.toLocaleString()}₫</Fee>
              </DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Dự kiến giao:</DetailLabel>
              <DetailValue>
                {shippingInfo.expectedDelivery 
                  ? new Date(shippingInfo.expectedDelivery).toLocaleString('vi-VN')
                  : 'Chưa xác định'}
              </DetailValue>
            </DetailRow>
          </DetailGrid>

          <ButtonGroup>
            <ActionButton onClick={handleTracking}>
              📍 Tra Cứu Vận Đơn
            </ActionButton>
            <ActionButton onClick={handlePrintLabel}>
              🖨️ In Nhãn Giao Hàng
            </ActionButton>
          </ButtonGroup>
        </ShippingDetails>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const Logo = styled.img`
  height: 30px;
  object-fit: contain;
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
`;

const CustomerInfo = styled.div`
  background: #f9fafb;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.span`
  font-weight: 500;
  color: #6b7280;
  min-width: 120px;
`;

const Value = styled.span`
  color: #111827;
`;

const PackageInfo = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const CalculateButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const ServicesSection = styled.div`
  margin-top: 20px;
`;

const ServicesList = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
`;

const ServiceCard = styled.div<{ selected: boolean }>`
  border: 2px solid ${props => props.selected ? '#3b82f6' : '#e5e7eb'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  }
`;

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ServiceName = styled.div`
  font-weight: 600;
  color: #111827;
  font-size: 15px;
`;

const ServiceFee = styled.div`
  font-weight: 700;
  color: #3b82f6;
  font-size: 16px;
`;

const ServiceDetails = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const DeliveryTime = styled.div`
  margin-top: 4px;
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #3b82f6;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const CreateButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #059669;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const ShippingDetails = styled.div`
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  padding: 20px;
`;

const DetailGrid = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: #374151;
`;

const DetailValue = styled.span`
  color: #111827;
  font-weight: 600;
`;

const OrderCode = styled.span`
  font-family: 'Courier New', monospace;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
`;

const Fee = styled.span`
  color: #10b981;
  font-size: 18px;
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const ActionButton = styled.button`
  padding: 10px;
  background: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #3b82f6;
    color: white;
  }
`;

export default ShippingSection;
