import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
  margin: 100px auto;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 12px 32px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 10px;

  &:hover {
    background: #5568d3;
  }
`;

const Message = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
  background: ${props => 
    props.type === 'success' ? '#d4edda' :
    props.type === 'error' ? '#f8d7da' :
    '#d1ecf1'
  };
  color: ${props =>
    props.type === 'success' ? '#155724' :
    props.type === 'error' ? '#721c24' :
    '#0c5460'
  };
  border: 1px solid ${props =>
    props.type === 'success' ? '#c3e6cb' :
    props.type === 'error' ? '#f5c6cb' :
    '#bee5eb'
  };
`;

export default function FixToken() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setHasToken(!!token);
  }, []);

  const clearToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setHasToken(false);
    setMessage('✅ Token đã được xóa. Bây giờ hãy đăng nhập lại.');
    setMessageType('success');
  };

  const goToLogin = () => {
    router.push('/auth/login');
  };

  const testToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('❌ Không tìm thấy token. Hãy đăng nhập.');
      setMessageType('error');
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(`✅ Token hợp lệ! User: ${data.email}`);
        setMessageType('success');
      } else {
        setMessage(`❌ Token không hợp lệ (${res.status}). Hãy đăng nhập lại.`);
        setMessageType('error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`❌ Lỗi kết nối: ${errorMessage}`);
      setMessageType('error');
    }
  };

  return (
    <Container>
      <Title>🔧 Fix Token Issue</Title>
      
      <Message type="info">
        <strong>Vấn đề:</strong> Token không hợp lệ hoặc đã hết hạn
        <br />
        <strong>Giải pháp:</strong> Xóa token cũ và đăng nhập lại
      </Message>

      {hasToken && (
        <Message type="info">
          ✅ Đã tìm thấy token trong localStorage
        </Message>
      )}

      {!hasToken && (
        <Message type="error">
          ❌ Không tìm thấy token. Bạn cần đăng nhập.
        </Message>
      )}

      {message && (
        <Message type={messageType}>
          {message}
        </Message>
      )}

      <div>
        <Button onClick={testToken}>
          🧪 Test Token
        </Button>
        <Button onClick={clearToken}>
          🗑️ Xóa Token
        </Button>
        <Button onClick={goToLogin}>
          🔐 Đăng Nhập
        </Button>
      </div>

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666', textAlign: 'left' }}>
        <strong>Hướng dẫn:</strong>
        <ol>
          <li>Click "Test Token" để kiểm tra token hiện tại</li>
          <li>Nếu token không hợp lệ, click "Xóa Token"</li>
          <li>Click "Đăng Nhập" để login lại</li>
          <li>Sau khi login, quay lại profile và test lại</li>
        </ol>
      </div>
    </Container>
  );
}
