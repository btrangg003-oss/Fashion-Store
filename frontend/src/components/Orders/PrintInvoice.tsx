import React from 'react';
import styled from 'styled-components';

interface PrintInvoiceProps {
  order: any;
  onPrint?: () => void;
}

const PrintInvoice: React.FC<PrintInvoiceProps> = ({ order, onPrint }) => {
  const handlePrint = () => {
    window.print();
    if (onPrint) onPrint();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getPaymentMethodText = (method: string) => {
    const map: any = {
      cod: 'Thanh toán khi nhận hàng',
      banking: 'Chuyển khoản ngân hàng',
      momo: 'Ví MoMo',
      atm: 'Thẻ ATM',
      credit: 'Thẻ tín dụng'
    };
    return map[method] || method;
  };

  const getStatusText = (status: string) => {
    const map: any = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      processing: 'Đang xử lý',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    };
    return map[status] || status;
  };

  return (
    <>
      <PrintButton onClick={handlePrint}>
        🖨️ In hóa đơn
      </PrintButton>
      
      <InvoiceContainer id="invoice-print">
        {/* Header */}
        <InvoiceHeader>
          <CompanyInfo>
            <CompanyLogo>
              <LogoText>FASHION STORE</LogoText>
            </CompanyLogo>
            <CompanyDetails>
              <div><strong>CÔNG TY TNHH THỜI TRANG FASHION STORE</strong></div>
              <div>Địa chỉ: 123 Nguyễn Văn Linh, Quận 7, TP.HCM</div>
              <div>Điện thoại: (028) 1234 5678 | Email: info@fashionstore.com</div>
              <div>Website: www.fashionstore.com</div>
            </CompanyDetails>
          </CompanyInfo>
          
          <InvoiceTitle>
            <h1>HÓA ĐƠN BÁN HÀNG</h1>
            <InvoiceNumber>Số: {order.orderNumber}</InvoiceNumber>
            <InvoiceDate>Ngày: {formatDate(order.createdAt)}</InvoiceDate>
          </InvoiceTitle>
        </InvoiceHeader>

        {/* Customer Info */}
        <CustomerSection>
          <SectionTitle>THÔNG TIN KHÁCH HÀNG</SectionTitle>
          <CustomerGrid>
            <CustomerInfo>
              <InfoRow>
                <InfoLabel>Họ tên:</InfoLabel>
                <InfoValue>{order.shippingAddress?.fullName || (order as any).customerName}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Điện thoại:</InfoLabel>
                <InfoValue>{order.shippingAddress?.phone || (order as any).customerPhone}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Email:</InfoLabel>
                <InfoValue>{(order as any).customerEmail}</InfoValue>
              </InfoRow>
            </CustomerInfo>
            <AddressInfo>
              <InfoRow>
                <InfoLabel>Địa chỉ giao hàng:</InfoLabel>
                <InfoValue>
                  {order.shippingAddress?.address}, {order.shippingAddress?.ward}, {order.shippingAddress?.district}, {order.shippingAddress?.city}
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Phương thức thanh toán:</InfoLabel>
                <InfoValue>{getPaymentMethodText(order.paymentMethod)}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Trạng thái:</InfoLabel>
                <InfoValue>{getStatusText(order.status)}</InfoValue>
              </InfoRow>
            </AddressInfo>
          </CustomerGrid>
        </CustomerSection>

        {/* Products Table */}
        <ProductsSection>
          <SectionTitle>CHI TIẾT SẢN PHẨM</SectionTitle>
          <ProductsTable>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên sản phẩm</th>
                <th>Size</th>
                <th>Màu</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item: any, index: number) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.size || '-'}</td>
                  <td>{item.color || '-'}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price)}₫</td>
                  <td>{formatPrice(item.price * item.quantity)}₫</td>
                </tr>
              ))}
            </tbody>
          </ProductsTable>
        </ProductsSection>

        {/* Summary */}
        <SummarySection>
          <SummaryTable>
            <tbody>
              <tr>
                <td>Tạm tính:</td>
                <td>{formatPrice(order.subtotal || 0)}₫</td>
              </tr>
              <tr>
                <td>Phí vận chuyển:</td>
                <td>{formatPrice(order.shipping || order.shippingFee || 0)}₫</td>
              </tr>
              <tr className="total-row">
                <td><strong>TỔNG CỘNG:</strong></td>
                <td><strong>{formatPrice(order.total || 0)}₫</strong></td>
              </tr>
            </tbody>
          </SummaryTable>
        </SummarySection>

        {/* Notes */}
        {order.notes && (
          <NotesSection>
            <SectionTitle>GHI CHÚ</SectionTitle>
            <NotesContent>{order.notes}</NotesContent>
          </NotesSection>
        )}

        {/* Footer */}
        <InvoiceFooter>
          <FooterSection>
            <FooterTitle>KHÁCH HÀNG</FooterTitle>
            <FooterSignature>
              <div>(Ký, ghi rõ họ tên)</div>
            </FooterSignature>
          </FooterSection>
          
          <FooterSection>
            <FooterTitle>NGƯỜI BÁN HÀNG</FooterTitle>
            <FooterSignature>
              <div>(Ký, ghi rõ họ tên)</div>
            </FooterSignature>
          </FooterSection>
          
          <FooterSection>
            <FooterTitle>THỦ KHO</FooterTitle>
            <FooterSignature>
              <div>(Ký, ghi rõ họ tên)</div>
            </FooterSignature>
          </FooterSection>
        </InvoiceFooter>

        {/* Print Info */}
        <PrintInfo>
          <div>Hóa đơn được in lúc: {new Date().toLocaleString('vi-VN')}</div>
          <div>Người in: Admin</div>
        </PrintInfo>
      </InvoiceContainer>
    </>
  );
};

const PrintButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;

  &:hover {
    background: #059669;
  }

  @media print {
    display: none;
  }
`;

const InvoiceContainer = styled.div`
  max-width: 210mm;
  margin: 0 auto;
  padding: 20mm;
  background: white;
  font-family: 'Times New Roman', serif;
  font-size: 14px;
  line-height: 1.4;
  color: #000;

  @media print {
    margin: 0;
    padding: 15mm;
    box-shadow: none;
    font-size: 12px;
  }

  @media screen {
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    margin: 2rem auto;
  }
`;

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #000;

  @media print {
    margin-bottom: 20px;
    padding-bottom: 15px;
  }
`;

const CompanyInfo = styled.div`
  flex: 1;
`;

const CompanyLogo = styled.div`
  margin-bottom: 15px;
`;

const LogoText = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  letter-spacing: 2px;

  @media print {
    color: #000;
    font-size: 20px;
  }
`;

const CompanyDetails = styled.div`
  font-size: 12px;
  line-height: 1.6;

  div {
    margin-bottom: 3px;
  }

  @media print {
    font-size: 11px;
  }
`;

const InvoiceTitle = styled.div`
  text-align: center;
  
  h1 {
    font-size: 24px;
    font-weight: bold;
    margin: 0 0 10px 0;
    text-transform: uppercase;
    letter-spacing: 1px;

    @media print {
      font-size: 20px;
    }
  }
`;

const InvoiceNumber = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;

  @media print {
    font-size: 14px;
  }
`;

const InvoiceDate = styled.div`
  font-size: 14px;

  @media print {
    font-size: 12px;
  }
`;

const CustomerSection = styled.div`
  margin-bottom: 30px;

  @media print {
    margin-bottom: 20px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  padding: 8px 0;
  border-bottom: 1px solid #ccc;
  text-transform: uppercase;

  @media print {
    font-size: 14px;
    margin-bottom: 10px;
  }
`;

const CustomerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;

  @media print {
    gap: 20px;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const CustomerInfo = styled.div``;
const AddressInfo = styled.div``;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 8px;
  align-items: flex-start;

  @media print {
    margin-bottom: 6px;
  }
`;

const InfoLabel = styled.div`
  font-weight: bold;
  min-width: 120px;
  flex-shrink: 0;

  @media print {
    min-width: 100px;
  }
`;

const InfoValue = styled.div`
  flex: 1;
`;

const ProductsSection = styled.div`
  margin-bottom: 30px;

  @media print {
    margin-bottom: 20px;
  }
`;

const ProductsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;

  th, td {
    border: 1px solid #000;
    padding: 8px;
    text-align: left;

    @media print {
      padding: 6px;
      font-size: 11px;
    }
  }

  th {
    background: #f5f5f5;
    font-weight: bold;
    text-align: center;

    @media print {
      background: #e5e5e5;
    }
  }

  td:nth-child(1) {
    text-align: center;
    width: 50px;
  }

  td:nth-child(3), td:nth-child(4) {
    text-align: center;
    width: 80px;
  }

  td:nth-child(5) {
    text-align: center;
    width: 80px;
  }

  td:nth-child(6), td:nth-child(7) {
    text-align: right;
    width: 120px;
  }
`;

const SummarySection = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;

  @media print {
    margin-bottom: 20px;
  }
`;

const SummaryTable = styled.table`
  width: 300px;
  border-collapse: collapse;

  td {
    padding: 8px 12px;
    border: 1px solid #000;

    @media print {
      padding: 6px 10px;
    }
  }

  td:first-child {
    font-weight: bold;
    background: #f5f5f5;

    @media print {
      background: #e5e5e5;
    }
  }

  td:last-child {
    text-align: right;
    font-weight: bold;
  }

  .total-row td {
    background: #667eea;
    color: white;
    font-size: 16px;

    @media print {
      background: #000;
      font-size: 14px;
    }
  }
`;

const NotesSection = styled.div`
  margin-bottom: 30px;

  @media print {
    margin-bottom: 20px;
  }
`;

const NotesContent = styled.div`
  padding: 15px;
  border: 1px solid #ccc;
  background: #f9f9f9;
  border-radius: 4px;

  @media print {
    background: #f5f5f5;
    padding: 10px;
  }
`;

const InvoiceFooter = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 50px;
  margin-bottom: 30px;

  @media print {
    margin-top: 30px;
    margin-bottom: 20px;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 30px;
  }
`;

const FooterSection = styled.div`
  text-align: center;
  flex: 1;
`;

const FooterTitle = styled.div`
  font-weight: bold;
  margin-bottom: 50px;
  text-transform: uppercase;

  @media print {
    margin-bottom: 40px;
  }
`;

const FooterSignature = styled.div`
  border-top: 1px solid #000;
  padding-top: 10px;
  font-size: 12px;

  @media print {
    font-size: 11px;
  }
`;

const PrintInfo = styled.div`
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ccc;
  font-size: 12px;
  color: #666;
  text-align: center;

  div {
    margin-bottom: 5px;
  }

  @media print {
    font-size: 10px;
    color: #000;
  }
`;

export default PrintInvoice;