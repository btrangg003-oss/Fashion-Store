import { useEffect, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: #333;
`;

const Section = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    background: #5568d3;
  }
`;

const Code = styled.pre`
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 13px;
`;

export default function TestLoyalty() {
  const [token, setToken] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const testPointsAPI = async () => {
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await fetch('/api/loyalty/points', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
      } else {
        setError(`Error ${res.status}: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testTransactionsAPI = async () => {
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await fetch('/api/loyalty/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
      } else {
        setError(`Error ${res.status}: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testTiersAPI = async () => {
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await fetch('/api/loyalty/tiers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
      } else {
        setError(`Error ${res.status}: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>🧪 Loyalty API Test</Title>

      <Section>
        <h3>Token Status</h3>
        {token ? (
          <div>
            <p style={{ color: 'green' }}>✅ Token found</p>
            <Code>{token.substring(0, 50)}...</Code>
          </div>
        ) : (
          <p style={{ color: 'red' }}>❌ No token found. Please login first.</p>
        )}
      </Section>

      <Section>
        <h3>Test APIs</h3>
        <Button onClick={testPointsAPI} disabled={!token || loading}>
          Test Points API
        </Button>
        <Button onClick={testTransactionsAPI} disabled={!token || loading}>
          Test Transactions API
        </Button>
        <Button onClick={testTiersAPI} disabled={!token || loading}>
          Test Tiers API
        </Button>
      </Section>

      {loading && (
        <Section>
          <p>⏳ Loading...</p>
        </Section>
      )}

      {error && (
        <Section style={{ background: '#fee', border: '1px solid #fcc' }}>
          <h3 style={{ color: '#c00' }}>❌ Error</h3>
          <p>{error}</p>
        </Section>
      )}

      {response && (
        <Section style={{ background: '#efe', border: '1px solid #cfc' }}>
          <h3 style={{ color: '#0a0' }}>✅ Response</h3>
          <Code>{JSON.stringify(response, null, 2)}</Code>
        </Section>
      )}

      <Section>
        <h3>📝 Instructions</h3>
        <ol>
          <li>Make sure you're logged in</li>
          <li>Click one of the test buttons above</li>
          <li>Check the response or error</li>
          <li>If you see 401 error, try logging in again</li>
        </ol>
      </Section>
    </Container>
  );
}
