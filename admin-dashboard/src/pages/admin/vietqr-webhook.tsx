import React, { useState } from 'react';
import styled from 'styled-components';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import { FiCheck, FiX, FiRefreshCw, FiSettings } from 'react-icons/fi';

export default function VietQRWebhookPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [apiKey, setApiKey] = useState('');

  const setupWebhook = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/setup-vietqr-webhook', {
        method: 'POST'
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveAdminLayout>
      <Container>
        <Header>
          <Title>
            <FiSettings />
            Cấu Hình VietQR Webhook
          </Title>
          <Subtitle>Tự động xác nhận thanh toán qua Suno VietQR</Subtitle>
        </Header>

        <InfoCard>
          <h3>📋 Thông Tin</h3>
          <ul>
            <li><strong>Webhook URL:</strong> {process.env.NEXT_PUBLIC_APP_URL}/api/payment/vietqr/webhook</li>
            <li><strong>Tài khoản:</strong> 1057925369 (Vietcombank)</li>
            <li><strong>Chủ TK:</strong> FASHION STORE</li>
          </ul>
        </InfoCard>

        <StepsCard>
          <h3>🚀 Hướng Dẫn Setup</h3>
          <ol>
            <li>
              <strong>Đăng ký Suno VietQR:</strong>
              <ul>
                <li>Truy cập: <a href="https://suno.vn" target="_blank" rel="noopener noreferrer">https://suno.vn</a></li>
                <li>Đăng ký tài khoản miễn phí</li>
                <li>Xác thực tài khoản ngân hàng (1057925369)</li>
              </ul>
            </li>
            <li>
              <strong>Lấy API Key:</strong>
              <ul>
                <li>Vào Dashboard → Settings → API Keys</li>
                <li>Tạo API key mới</li>
                <li>Copy API key</li>
              </ul>
            </li>
            <li>
              <strong>Cấu hình trong .env.local:</strong>
              <CodeBlock>
                SUNO_API_KEY=your_api_key_here
              </CodeBlock>
            </li>
            <li>
              <strong>Restart dev server:</strong>
              <CodeBlock>
                npm run dev
              </CodeBlock>
            </li>
            <li>
              <strong>Click nút "Đăng Ký Webhook" bên dưới</strong>
            </li>
          </ol>
        </StepsCard>

        <ActionCard>
          <h3>⚙️ Đăng Ký Webhook</h3>
          <p>Click nút bên dưới để đăng ký webhook với Suno VietQR</p>
          
          <Button onClick={setupWebhook} disabled={loading}>
            {loading ? (
              <><FiRefreshCw className="spin" /> Đang đăng ký...</>
            ) : (
              <><FiSettings /> Đăng Ký Webhook</>
            )}
          </Button>
        </ActionCard>

        {result && (
          <ResultCard success={result.success}>
            <ResultTitle>
              {result.success ? <><FiCheck /> Thành Công!</> : <><FiX /> Lỗi!</>}
            </ResultTitle>

            {result.success ? (
              <div>
                <p><strong>Message:</strong> {result.message}</p>
                <p><strong>Webhook URL:</strong> {result.webhookUrl}</p>
                <p><strong>Account Number:</strong> {result.accountNumber}</p>
                
                <SuccessBox>
                  <h4>✅ Webhook đã được đăng ký!</h4>
                  <p>Từ giờ, mỗi khi có giao dịch chuyển khoản vào tài khoản:</p>
                  <ul>
                    <li>Suno sẽ tự động gửi thông báo đến webhook</li>
                    <li>Hệ thống sẽ tự động xác nhận thanh toán</li>
                    <li>Đơn hàng sẽ tự động chuyển sang "Đang xử lý"</li>
                    <li>Không cần xác nhận thủ công nữa!</li>
                  </ul>
                </SuccessBox>
              </div>
            ) : (
              <div>
                <p><strong>Error:</strong> {result.error || result.message}</p>
                
                {result.instructions && (
                  <InstructionsBox>
                    <h4>📝 Hướng dẫn:</h4>
                    <ol>
                      {result.instructions.map((instruction: string, index: number) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </InstructionsBox>
                )}
              </div>
            )}

            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                📋 Chi tiết
              </summary>
              <pre style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'auto', fontSize: '0.875rem' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </ResultCard>
        )}

        <FeaturesCard>
          <h3>✨ Tính Năng Webhook</h3>
          <FeaturesList>
            <Feature>
              <FeatureIcon>⚡</FeatureIcon>
              <FeatureContent>
                <FeatureTitle>Tự động xác nhận</FeatureTitle>
                <FeatureDesc>Không cần xác nhận thủ công</FeatureDesc>
              </FeatureContent>
            </Feature>
            <Feature>
              <FeatureIcon>🔔</FeatureIcon>
              <FeatureContent>
                <FeatureTitle>Thông báo real-time</FeatureTitle>
                <FeatureDesc>Nhận thông báo ngay khi có tiền</FeatureDesc>
              </FeatureContent>
            </Feature>
            <Feature>
              <FeatureIcon>✅</FeatureIcon>
              <FeatureContent>
                <FeatureTitle>Chính xác 100%</FeatureTitle>
                <FeatureDesc>Đối chiếu số tiền tự động</FeatureDesc>
              </FeatureContent>
            </Feature>
            <Feature>
              <FeatureIcon>📊</FeatureIcon>
              <FeatureContent>
                <FeatureTitle>Lưu lịch sử</FeatureTitle>
                <FeatureDesc>Lưu đầy đủ thông tin giao dịch</FeatureDesc>
              </FeatureContent>
            </Feature>
          </FeaturesList>
        </FeaturesCard>
      </Container>
    </ResponsiveAdminLayout>
  );
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0;
`;

const InfoCard = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;

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

const StepsCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;

  h3 {
    margin: 0 0 1rem 0;
  }

  ol {
    margin: 0;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 1rem;
  }

  ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  a {
    color: #3b82f6;
    text-decoration: underline;
  }
`;

const CodeBlock = styled.code`
  display: block;
  background: #1f2937;
  color: #10b981;
  padding: 1rem;
  border-radius: 6px;
  margin: 0.5rem 0;
  font-family: 'Courier New', monospace;
`;

const ActionCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  text-align: center;

  h3 {
    margin: 0 0 0.5rem 0;
  }

  p {
    color: #6b7280;
    margin: 0 0 1.5rem 0;
  }
`;

const Button = styled.button`
  padding: 1rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #2563eb;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ResultCard = styled.div<{ success: boolean }>`
  background: ${props => props.success ? '#f0fdf4' : '#fef2f2'};
  border: 2px solid ${props => props.success ? '#86efac' : '#fca5a5'};
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const ResultTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SuccessBox = styled.div`
  background: rgba(16, 185, 129, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;

  h4 {
    margin: 0 0 0.5rem 0;
    color: #065f46;
  }

  p {
    margin: 0 0 0.5rem 0;
    color: #065f46;
  }

  ul {
    margin: 0;
    padding-left: 1.5rem;
    color: #065f46;
  }
`;

const InstructionsBox = styled.div`
  background: rgba(239, 68, 68, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;

  h4 {
    margin: 0 0 0.5rem 0;
    color: #991b1b;
  }

  ol {
    margin: 0;
    padding-left: 1.5rem;
    color: #991b1b;
  }
`;

const FeaturesCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  padding: 2rem;
  border-radius: 12px;

  h3 {
    margin: 0 0 1.5rem 0;
  }
`;

const FeaturesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const Feature = styled.div`
  display: flex;
  gap: 1rem;
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
`;

const FeatureContent = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const FeatureDesc = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;
