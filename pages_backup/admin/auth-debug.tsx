import React from 'react';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import AuthDebug from '@/components/Admin/AuthDebug';
import styled from 'styled-components';

const AuthDebugPage = () => {
    return (
        <ResponsiveAdminLayout>
            <Container>
                <Header>
                    <Title>Authentication Debug</Title>
                    <Description>
                        Công cụ này giúp kiểm tra trạng thái xác thực của admin và debug các vấn đề về cookie/token.
                    </Description>
                </Header>

                <AuthDebug />

                <Instructions>
                    <InstructionTitle>📋 Hướng dẫn sử dụng:</InstructionTitle>
                    <ol>
                        <li>Click nút "Check Auth Status" để kiểm tra trạng thái đăng nhập</li>
                        <li>Xem thông tin user và cookies được gửi kèm request</li>
                        <li>Nếu không authenticated, hãy đăng nhập lại tại /admin/login</li>
                        <li>Nếu vẫn lỗi, kiểm tra console browser để xem chi tiết</li>
                    </ol>

                    <TroubleshootingSection>
                        <InstructionTitle>🔧 Khắc phục sự cố:</InstructionTitle>
                        <ul>
                            <li><strong>No token found:</strong> Cookie không được set hoặc đã hết hạn. Đăng nhập lại.</li>
                            <li><strong>Invalid token:</strong> Token không hợp lệ. Xóa cookies và đăng nhập lại.</li>
                            <li><strong>Available Cookies = []:</strong> Browser không gửi cookies. Kiểm tra SameSite policy.</li>
                        </ul>
                    </TroubleshootingSection>
                </Instructions>
            </Container>
        </ResponsiveAdminLayout>
    );
};

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
`;

const Description = styled.p`
  color: #4a5568;
  font-size: 1rem;
  margin: 0;
`;

const Instructions = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  ol, ul {
    margin: 12px 0;
    padding-left: 24px;
    
    li {
      margin-bottom: 8px;
      color: #4a5568;
      line-height: 1.6;
    }
  }
`;

const InstructionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 12px 0;
`;

const TroubleshootingSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  
  ul {
    li {
      strong {
        color: #1a202c;
      }
    }
  }
`;

export default AuthDebugPage;
