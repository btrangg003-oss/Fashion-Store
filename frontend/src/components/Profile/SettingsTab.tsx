import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FiBell, FiMail, FiLock, FiGlobe, FiEye, FiShield, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Container = styled.div`
  max-width: 800px;
`;

const Section = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const SettingDescription = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #667eea;
  }

  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 26px;

  &:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$variant === 'danger' ? '#ef4444' : '#667eea'};
  color: white;

  &:hover {
    background: ${props => props.$variant === 'danger' ? '#dc2626' : '#5a67d8'};
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const DangerZone = styled.div`
  border: 2px solid #ef4444;
  border-radius: 12px;
  padding: 20px;
  background: #fef2f2;
`;

const DangerTitle = styled.h4`
  color: #ef4444;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DangerText = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
`;

const ThemeToggleContainer = styled.div`
  display: flex;
  gap: 8px;
  background: var(--bg-secondary);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
`;

const ThemeOption = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$active ? '#667eea' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: ${props => props.$active ? '#5a67d8' : 'var(--bg-hover)'};
  }
`;

const LanguageToggleContainer = styled.div`
  display: flex;
  gap: 8px;
  background: var(--bg-secondary);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
`;

const LanguageOption = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$active ? '#667eea' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: ${props => props.$active ? '#5a67d8' : 'var(--bg-hover)'};
  }
`;

export const SettingsTab: React.FC = () => {
    const { user, updateUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const { language, setLanguage } = useLanguage();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        orderUpdates: true,
        promotions: false,
        newsletter: true,
        smsNotifications: false,
        language: 'vi',
        currency: 'VND',
        twoFactorAuth: false,
        loginAlerts: true
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        // TODO: Save to backend
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSettings(prev => ({
            ...prev,
            language: e.target.value
        }));
        // TODO: Save to backend
    };

    const handleChangePassword = async () => {
        const email = user?.email;
        if (!email) {
            alert('Không tìm thấy email');
            return;
        }

        if (!confirm('Bạn sẽ nhận được email với link đặt lại mật khẩu. Tiếp tục?')) {
            return;
        }

        try {
            const response = await fetch('/api/auth/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Đã gửi email! Vui lòng kiểm tra hộp thư của bạn.');
            } else {
                alert('❌ Có lỗi xảy ra. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error requesting password reset:', error);
            alert('❌ Có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    const handleDeleteAccount = () => {
        if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
            // TODO: Implement delete account
            alert('Xóa tài khoản');
        }
    };

    return (
        <Container>
            {/* Notifications */}
            <Section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <SectionTitle>
                    <FiBell />
                    Thông báo
                </SectionTitle>

                <SettingItem>
                    <SettingInfo>
                        <SettingLabel>Email thông báo</SettingLabel>
                        <SettingDescription>Nhận thông báo qua email</SettingDescription>
                    </SettingInfo>
                    <Toggle>
                        <ToggleInput
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={() => handleToggle('emailNotifications')}
                        />
                        <ToggleSlider />
                    </Toggle>
                </SettingItem>

                <SettingItem>
                    <SettingInfo>
                        <SettingLabel>Cập nhật đơn hàng</SettingLabel>
                        <SettingDescription>Thông báo về trạng thái đơn hàng</SettingDescription>
                    </SettingInfo>
                    <Toggle>
                        <ToggleInput
                            type="checkbox"
                            checked={settings.orderUpdates}
                            onChange={() => handleToggle('orderUpdates')}
                        />
                        <ToggleSlider />
                    </Toggle>
                </SettingItem>

                <SettingItem>
                    <SettingInfo>
                        <SettingLabel>Khuyến mãi & Ưu đãi</SettingLabel>
                        <SettingDescription>Nhận thông báo về chương trình khuyến mãi</SettingDescription>
                    </SettingInfo>
                    <Toggle>
                        <ToggleInput
                            type="checkbox"
                            checked={settings.promotions}
                            onChange={() => handleToggle('promotions')}
                        />
                        <ToggleSlider />
                    </Toggle>
                </SettingItem>

                <SettingItem>
                    <SettingInfo>
                        <SettingLabel>SMS thông báo</SettingLabel>
                        <SettingDescription>Nhận thông báo qua SMS</SettingDescription>
                    </SettingInfo>
                    <Toggle>
                        <ToggleInput
                            type="checkbox"
                            checked={settings.smsNotifications}
                            onChange={() => handleToggle('smsNotifications')}
                        />
                        <ToggleSlider />
                    </Toggle>
                </SettingItem>
            </Section>

            {/* Appearance */}
            <Section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <SectionTitle>
                    <FiEye />
                    Giao diện
                </SectionTitle>

                <SettingItem>
                    <SettingInfo>
                        <SettingLabel>Chủ đề</SettingLabel>
                        <SettingDescription>Chọn chủ đề sáng hoặc tối</SettingDescription>
                    </SettingInfo>
                    <ThemeToggleContainer>
                        <ThemeOption $active={theme === 'light'} onClick={() => setTheme('light')}>
                            ☀️ Sáng
                        </ThemeOption>
                        <ThemeOption $active={theme === 'dark'} onClick={() => setTheme('dark')}>
                            🌙 Tối
                        </ThemeOption>
                    </ThemeToggleContainer>
                </SettingItem>
            </Section>

            {/* Language & Region */}
            <Section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <SectionTitle>
                    <FiGlobe />
                    Ngôn ngữ & Khu vực
                </SectionTitle>

                <SettingItem>
                    <SettingInfo>
                        <SettingLabel>Ngôn ngữ</SettingLabel>
                        <SettingDescription>Chọn ngôn ngữ hiển thị</SettingDescription>
                    </SettingInfo>
                    <LanguageToggleContainer>
                        <LanguageOption $active={language === 'vi'} onClick={() => setLanguage('vi')}>
                            🇻🇳 Tiếng Việt
                        </LanguageOption>
                        <LanguageOption $active={language === 'en'} onClick={() => setLanguage('en')}>
                            🇬🇧 English
                        </LanguageOption>
                    </LanguageToggleContainer>
                </SettingItem>

                <SettingItem>
                    <SettingInfo>
                        <SettingLabel>Đơn vị tiền tệ</SettingLabel>
                        <SettingDescription>Đơn vị tiền tệ hiển thị</SettingDescription>
                    </SettingInfo>
                    <Select value={settings.currency} onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}>
                        <option value="VND">VND (₫)</option>
                        <option value="USD">USD ($)</option>
                    </Select>
                </SettingItem>
            </Section>

            {/* Security */}
            <Section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <SectionTitle>
                    <FiShield />
                    Bảo mật
                </SectionTitle>

                <SettingItem>
                    <SettingInfo>
                        <SettingLabel>Đổi mật khẩu</SettingLabel>
                        <SettingDescription>Cập nhật mật khẩu của bạn</SettingDescription>
                    </SettingInfo>
                    <Button onClick={handleChangePassword}>
                        <FiLock /> Đổi mật khẩu
                    </Button>
                </SettingItem>

                <SettingItem>
                    <SettingInfo>
                        <SettingLabel>Xác thực 2 bước</SettingLabel>
                        <SettingDescription>Tăng cường bảo mật tài khoản</SettingDescription>
                    </SettingInfo>
                    <Toggle>
                        <ToggleInput
                            type="checkbox"
                            checked={settings.twoFactorAuth}
                            onChange={() => handleToggle('twoFactorAuth')}
                        />
                        <ToggleSlider />
                    </Toggle>
                </SettingItem>

                <SettingItem>
                    <SettingInfo>
                        <SettingLabel>Cảnh báo đăng nhập</SettingLabel>
                        <SettingDescription>Thông báo khi có đăng nhập mới</SettingDescription>
                    </SettingInfo>
                    <Toggle>
                        <ToggleInput
                            type="checkbox"
                            checked={settings.loginAlerts}
                            onChange={() => handleToggle('loginAlerts')}
                        />
                        <ToggleSlider />
                    </Toggle>
                </SettingItem>
            </Section>

            {/* Privacy */}
            <Section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <SectionTitle>
                    <FiEye />
                    Quyền riêng tư
                </SectionTitle>

                <SettingItem>
                    <SettingInfo>
                        <SettingLabel>Lịch sử mua hàng</SettingLabel>
                        <SettingDescription>Cho phép hiển thị lịch sử mua hàng</SettingDescription>
                    </SettingInfo>
                    <Toggle>
                        <ToggleInput type="checkbox" defaultChecked />
                        <ToggleSlider />
                    </Toggle>
                </SettingItem>

                <SettingItem>
                    <SettingInfo>
                        <SettingLabel>Đề xuất cá nhân hóa</SettingLabel>
                        <SettingDescription>Sử dụng dữ liệu để đề xuất sản phẩm</SettingDescription>
                    </SettingInfo>
                    <Toggle>
                        <ToggleInput type="checkbox" defaultChecked />
                        <ToggleSlider />
                    </Toggle>
                </SettingItem>
            </Section>

            {/* Danger Zone */}
            <Section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <DangerZone>
                    <DangerTitle>
                        <FiTrash2 />
                        Vùng nguy hiểm
                    </DangerTitle>
                    <DangerText>
                        Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
                    </DangerText>
                    <Button $variant="danger" onClick={handleDeleteAccount}>
                        Xóa tài khoản
                    </Button>
                </DangerZone>
            </Section>
        </Container>
    );
};

export default SettingsTab;
