import React, { useState } from 'react';
import styled from 'styled-components';

export default function TestMoMo() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testMoMo = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test/momo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: 'Network error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>🧪 Test MoMo API</Title>

      <Card>
        <CardTitle>Kiểm tra MoMo Payment Gateway</CardTitle>
        <CardDescription>
          Test xem MoMo API keys có hoạt động không
        </CardDescription>

        <TestButton onClick={testMoMo} disabled={loading}>
          {loading ? '⏳ Đang test...' : '🚀 Test MoMo API'}
        </TestButton>
      </Card>

      {result && (
        <ResultCard success={result.success}>
          <ResultTitle>
            {result.success ? '✅ Thành Công!' : '❌ Lỗi!'}
          </ResultTitle>

          {result.success ? (
            <SuccessContent>
              <p><strong>Message:</strong> {result.message}</p>
              
              {result.data && (
                <>
                  <InfoGroup>
                    <Label>Order ID:</Label>
                    <Value>{result.data.orderId}</Value>
                  </InfoGroup>

                  <InfoGroup>
                    <Label>Amount:</Label>
                    <Value>{parseInt(result.data.amount).toLocaleString('vi-VN')} ₫</Value>
                  </InfoGroup>

                  {result.data.payUrl && (
                    <InfoGroup>
                      <Label>Payment URL:</Label>
                      <Link href={result.data.payUrl} target="_blank">
                        Mở trang thanh toán MoMo →
                      </Link>
                    </InfoGroup>
                  )}

                  {result.data.qrCodeUrl && (
                    <InfoGroup>
                      <Label>QR Code:</Label>
                      <QRImage src={result.data.qrCodeUrl} alt="MoMo QR" />
                    </InfoGroup>
                  )}
                </>
              )}

              <Details>
                <summary>📋 Full Response</summary>
                <pre>{JSON.stringify(result.fullResponse, null, 2)}</pre>
              </Details>
            </SuccessContent>
          ) : (
            <ErrorContent>
              <p><strong>Message:</strong> {result.message || result.error}</p>
              
              {result.error && typeof result.error === 'object' && (
                <>
                  <InfoGroup>
                    <Label>Result Code:</Label>
                    <Value>{result.error.resultCode}</Value>
                  </InfoGroup>

                  <InfoGroup>
                    <Label>Error Message:</Label>
                    <Value>{result.error.message}</Value>
                  </InfoGroup>

                  {result.error.localMessage && (
                    <InfoGroup>
                      <Label>Local Message:</Label>
                      <Value>{result.error.localMessage}</Value>
                    </InfoGroup>
                  )}
                </>
              )}

              {result.config && (
                <ConfigCheck>
                  <h4>Configuration Status:</h4>
                  <ul>
                    <li>Partner Code: {result.config.partnerCode ? '✅' : '❌'}</li>
                    <li>Access Key: {result.config.accessKey ? '✅' : '❌'}</li>
                    <li>Secret Key: {result.config.secretKey ? '✅' : '❌'}</li>
                    <li>Endpoint: {result.config.endpoint ? '✅' : '❌'}</li>
                  </ul>
                </ConfigCheck>
              )}

              <Details>
                <summary>📋 Full Response</summary>
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </Details>
            </ErrorContent>
          )}
        </ResultCard>
      )}

      <InfoCard>
        <h3>ℹ️ Thông Tin</h3>
        <ul>
          <li>Test này sẽ tạo một payment request 10,000 VND</li>
          <li>Không thực sự charge tiền</li>
          <li>Chỉ kiểm tra API keys có hợp lệ không</li>
          <li>Nếu thành công, bạn sẽ nhận được payment URL và QR code</li>
        </ul>
      </InfoCard>

      <BackButton onClick={() => window.location.href = '/'}>
        ← Quay lại trang chủ
      </BackButton>
    </Container>
  );
}

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
`;

const CardDescription = styled.p`
  color: #6b7280;
  margin: 0 0 1.5rem 0;
`;

const TestButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
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

const ResultCard = styled.div<{ success: boolean }>`
  background: ${props => props.success ? '#f0fdf4' : '#fef2f2'};
  border: 2px solid ${props => props.success ? '#86efac' : '#fca5a5'};
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
`;

const ResultTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
`;

const SuccessContent = styled.div`
  color: #166534;
`;

const ErrorContent = styled.div`
  color: #991b1b;
`;

const InfoGroup = styled.div`
  margin: 1rem 0;
`;

const Label = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const Value = styled.div`
  font-family: monospace;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  border-radius: 4px;
`;

const Link = styled.a`
  color: #2563eb;
  text-decoration: underline;
  
  &:hover {
    color: #1d4ed8;
  }
`;

const QRImage = styled.img`
  max-width: 300px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  margin-top: 0.5rem;
`;

const Details = styled.details`
  margin-top: 1rem;
  
  summary {
    cursor: pointer;
    font-weight: 600;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }
  
  pre {
    margin-top: 0.5rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.875rem;
  }
`;

const ConfigCheck = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  
  h4 {
    margin: 0 0 0.5rem 0;
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
  }
`;

const InfoCard = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  
  h3 {
    margin: 0 0 1rem 0;
    color: #1e40af;
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
    color: #1e40af;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
`;
