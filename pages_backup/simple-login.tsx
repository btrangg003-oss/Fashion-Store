import { useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 400px;
  margin: 100px auto;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  padding: 14px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #5568d3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ type: 'success' | 'error' }>`
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.type === 'success' ? '#c3e6cb' : '#f5c6cb'};
`;

const Debug = styled.pre`
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  overflow-x: auto;
  margin-top: 20px;
`;

export default function SimpleLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('taquy778@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [debugInfo, setDebugInfo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setDebugInfo('');

    try {
      console.log('🔐 Attempting login...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe: true }),
      });

      const data = await response.json();
      console.log('📦 Response:', data);

      if (response.ok && data.success) {
        // Save token to localStorage
        if (data.data.token) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          console.log('✅ Token saved to localStorage');
          
          setMessage('✅ Login thành công! Token đã được lưu.');
          setMessageType('success');
          
          setDebugInfo(JSON.stringify({
            token: data.data.token.substring(0, 50) + '...',
            user: data.data.user,
            tokenLength: data.data.token.length,
            expiresIn: data.data.expiresIn
          }, null, 2));

          // Redirect after 2 seconds
          setTimeout(() => {
            router.push('/profile');
          }, 2000);
        } else {
          setMessage('⚠️ Login thành công nhưng không có token!');
          setMessageType('error');
          setDebugInfo(JSON.stringify(data, null, 2));
        }
      } else {
        setMessage(`❌ ${data.message || 'Login failed'}`);
        setMessageType('error');
        setDebugInfo(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`❌ Error: ${errorMessage}`);
      setMessageType('error');
      setDebugInfo(JSON.stringify({ error: errorMessage }, null, 2));
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>🔐 Simple Login Test</Title>
      
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
        </Button>
      </Form>

      {message && (
        <Message type={messageType}>
          {message}
        </Message>
      )}

      {debugInfo && (
        <Debug>{debugInfo}</Debug>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <strong>Test Account:</strong>
        <br />
        Email: taquy778@gmail.com
        <br />
        Password: (nhập password của bạn)
      </div>
    </Container>
  );
}
