import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import { 
  FiSettings, FiUser, FiShield, FiMail, FiDatabase, 
  FiGlobe, FiDollarSign, FiPackage, FiSave, FiRefreshCw 
} from 'react-icons/fi';

interface Settings {
  general: {
    siteName: string;
    siteUrl: string;
    contactEmail: string;
    supportPhone: string;
  };
  payment: {
    currency: string;
    taxRate: number;
    shippingFee: number;
    freeShippingThreshold: number;
  };
  email: {
    provider: string;
    fromName: string;
    fromEmail: string;
    smtpHost: string;
    smtpPort: number;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireEmailVerification: boolean;
    enableTwoFactor: boolean;
  };
  inventory: {
    lowStockThreshold: number;
    autoReorderEnabled: boolean;
    reorderQuantity: number;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  // // const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setMessage('Cài đặt đã được lưu thành công!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Lỗi khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: keyof Settings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }));
  };

  if (loading) return <ResponsiveAdminLayout><Loading>Đang tải...</Loading></ResponsiveAdminLayout>;

  const tabs = [
    { id: 'general', label: 'Chung', icon: <FiSettings /> },
    { id: 'payment', label: 'Thanh toán', icon: <FiDollarSign /> },
    { id: 'email', label: 'Email', icon: <FiMail /> },
    { id: 'security', label: 'Bảo mật', icon: <FiShield /> },
    { id: 'inventory', label: 'Kho hàng', icon: <FiPackage /> }
  ];

  return (
    <ResponsiveAdminLayout>
      <Container>
        <Header>
          <Title>Cài Đặt Hệ Thống</Title>
          <SaveButton onClick={handleSave} disabled={saving}>
            {saving ? <FiRefreshCw className="spin" /> : <FiSave />}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </SaveButton>
        </Header>

        {message && (
          <Message
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {message}
          </Message>
        )}

        <Content>
          <Sidebar>
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </TabButton>
            ))}
          </Sidebar>

          <MainContent>
            {activeTab === 'general' && (
              <Section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <SectionTitle>Cài đặt chung</SectionTitle>
                <FormGroup>
                  <Label>Tên website</Label>
                  <Input
                    value={settings?.general.siteName}
                    onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>URL website</Label>
                  <Input
                    value={settings?.general.siteUrl}
                    onChange={(e) => handleChange('general', 'siteUrl', e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Email liên hệ</Label>
                  <Input
                    type="email"
                    value={settings?.general.contactEmail}
                    onChange={(e) => handleChange('general', 'contactEmail', e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Số điện thoại hỗ trợ</Label>
                  <Input
                    value={settings?.general.supportPhone}
                    onChange={(e) => handleChange('general', 'supportPhone', e.target.value)}
                  />
                </FormGroup>
              </Section>
            )}

            {activeTab === 'payment' && (
              <Section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <SectionTitle>Cài đặt thanh toán</SectionTitle>
                <FormGroup>
                  <Label>Đơn vị tiền tệ</Label>
                  <Select
                    value={settings?.payment.currency}
                    onChange={(e) => handleChange('payment', 'currency', e.target.value)}
                  >
                    <option value="VND">VND - Việt Nam Đồng</option>
                    <option value="USD">USD - US Dollar</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Thuế VAT (%)</Label>
                  <Input
                    type="number"
                    value={settings?.payment.taxRate}
                    onChange={(e) => handleChange('payment', 'taxRate', parseFloat(e.target.value))}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Phí vận chuyển (₫)</Label>
                  <Input
                    type="number"
                    value={settings?.payment.shippingFee}
                    onChange={(e) => handleChange('payment', 'shippingFee', parseInt(e.target.value))}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Miễn phí vận chuyển từ (₫)</Label>
                  <Input
                    type="number"
                    value={settings?.payment.freeShippingThreshold}
                    onChange={(e) => handleChange('payment', 'freeShippingThreshold', parseInt(e.target.value))}
                  />
                </FormGroup>
              </Section>
            )}

            {activeTab === 'email' && (
              <Section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <SectionTitle>Cài đặt email</SectionTitle>
                <FormGroup>
                  <Label>Nhà cung cấp</Label>
                  <Select
                    value={settings?.email.provider}
                    onChange={(e) => handleChange('email', 'provider', e.target.value)}
                  >
                    <option value="gmail">Gmail</option>
                    <option value="smtp">SMTP Custom</option>
                    <option value="postmark">Postmark</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Tên người gửi</Label>
                  <Input
                    value={settings?.email.fromName}
                    onChange={(e) => handleChange('email', 'fromName', e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Email người gửi</Label>
                  <Input
                    type="email"
                    value={settings?.email.fromEmail}
                    onChange={(e) => handleChange('email', 'fromEmail', e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>SMTP Host</Label>
                  <Input
                    value={settings?.email.smtpHost}
                    onChange={(e) => handleChange('email', 'smtpHost', e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>SMTP Port</Label>
                  <Input
                    type="number"
                    value={settings?.email.smtpPort}
                    onChange={(e) => handleChange('email', 'smtpPort', parseInt(e.target.value))}
                  />
                </FormGroup>
              </Section>
            )}

            {activeTab === 'security' && (
              <Section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <SectionTitle>Cài đặt bảo mật</SectionTitle>
                <FormGroup>
                  <Label>Thời gian hết phiên (phút)</Label>
                  <Input
                    type="number"
                    value={settings?.security.sessionTimeout}
                    onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Số lần đăng nhập tối đa</Label>
                  <Input
                    type="number"
                    value={settings?.security.maxLoginAttempts}
                    onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Độ dài mật khẩu tối thiểu</Label>
                  <Input
                    type="number"
                    value={settings?.security.passwordMinLength}
                    onChange={(e) => handleChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </FormGroup>
                <FormGroup>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={settings?.security.requireEmailVerification}
                      onChange={(e) => handleChange('security', 'requireEmailVerification', e.target.checked)}
                    />
                    Yêu cầu xác thực email
                  </CheckboxLabel>
                </FormGroup>
                <FormGroup>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={settings?.security.enableTwoFactor}
                      onChange={(e) => handleChange('security', 'enableTwoFactor', e.target.checked)}
                    />
                    Bật xác thực 2 yếu tố
                  </CheckboxLabel>
                </FormGroup>
              </Section>
            )}

            {activeTab === 'inventory' && (
              <Section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <SectionTitle>Cài đặt kho hàng</SectionTitle>
                <FormGroup>
                  <Label>Ngưỡng cảnh báo tồn kho thấp</Label>
                  <Input
                    type="number"
                    value={settings?.inventory.lowStockThreshold}
                    onChange={(e) => handleChange('inventory', 'lowStockThreshold', parseInt(e.target.value))}
                  />
                </FormGroup>
                <FormGroup>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={settings?.inventory.autoReorderEnabled}
                      onChange={(e) => handleChange('inventory', 'autoReorderEnabled', e.target.checked)}
                    />
                    Tự động đặt hàng lại
                  </CheckboxLabel>
                </FormGroup>
                <FormGroup>
                  <Label>Số lượng đặt hàng lại</Label>
                  <Input
                    type="number"
                    value={settings?.inventory.reorderQuantity}
                    onChange={(e) => handleChange('inventory', 'reorderQuantity', parseInt(e.target.value))}
                    disabled={!settings?.inventory.autoReorderEnabled}
                  />
                </FormGroup>
              </Section>
            )}
          </MainContent>
        </Content>
      </Container>
    </ResponsiveAdminLayout>
  );
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.6;
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

const Message = styled(motion.div)`
  padding: 1rem;
  background: #10b981;
  color: white;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TabButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${props => props.active ? '#3b82f6' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: ${props => props.active ? '#2563eb' : '#f3f4f6'};
  }
`;

const MainContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Section = styled(motion.div)``;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;
