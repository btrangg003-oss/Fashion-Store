import React, { useState } from 'react';
import styled from 'styled-components';

const AuthDebug: React.FC = () => {
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/auth-check', {
        credentials: 'include'
      });
      const data = await response.json();
      setAuthInfo(data);
    } catch (error) {
      setAuthInfo({ error: 'Failed to check auth', details: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>🔐 Auth Debug Tool</Title>
      <Button onClick={checkAuth} disabled={loading}>
        {loading ? 'Checking...' : 'Check Auth Status'}
      </Button>
      
      {authInfo && (
        <ResultBox>
          <Status authenticated={authInfo.authenticated}>
            {authInfo.authenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
          </Status>
          
          {authInfo.user && (
            <Section>
              <SectionTitle>User Info:</SectionTitle>
              <InfoItem>ID: {authInfo.user.id}</InfoItem>
              <InfoItem>Email: {authInfo.user.email}</InfoItem>
              <InfoItem>Role: {authInfo.user.role}</InfoItem>
            </Section>
          )}
          
          {authInfo.debug && (
            <Section>
              <SectionTitle>Debug Info:</SectionTitle>
              <InfoItem>Has Token: {authInfo.debug.hasToken ? 'Yes' : 'No'}</InfoItem>
              <InfoItem>Token Length: {authInfo.debug.tokenLength}</InfoItem>
              <InfoItem>Available Cookies: {authInfo.debug.availableCookies.join(', ') || 'None'}</InfoItem>
              
              {authInfo.debug.cookieNames && authInfo.debug.cookieNames.length > 0 && (
                <CookieList>
                  <strong>Cookie Details:</strong>
                  {authInfo.debug.cookieNames.map((cookie: any, idx: number) => (
                    <CookieItem key={idx}>
                      {cookie.name}: {cookie.valuePreview}
                    </CookieItem>
                  ))}
                </CookieList>
              )}
            </Section>
          )}
          
          {authInfo.error && (
            <ErrorSection>
              <SectionTitle>Error:</SectionTitle>
              <ErrorText>{authInfo.error}</ErrorText>
              {authInfo.message && <ErrorText>{authInfo.message}</ErrorText>}
            </ErrorSection>
          )}
          
          <RawData>
            <SectionTitle>Raw Response:</SectionTitle>
            <pre>{JSON.stringify(authInfo, null, 2)}</pre>
          </RawData>
        </ResultBox>
      )}
    </Container>
  );
};

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 20px auto;
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  color: #1a202c;
  font-size: 1.5rem;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResultBox = styled.div`
  margin-top: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  background: #f7fafc;
`;

const Status = styled.div<{ authenticated: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.authenticated ? '#10b981' : '#ef4444'};
  margin-bottom: 20px;
  padding: 12px;
  background: ${props => props.authenticated ? '#d1fae5' : '#fee2e2'};
  border-radius: 6px;
  text-align: center;
`;

const Section = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 6px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
`;

const InfoItem = styled.div`
  padding: 8px 0;
  color: #4a5568;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
`;

const CookieList = styled.div`
  margin-top: 12px;
  
  strong {
    display: block;
    margin-bottom: 8px;
    color: #1a202c;
  }
`;

const CookieItem = styled.div`
  padding: 6px 12px;
  background: #f3f4f6;
  border-radius: 4px;
  margin-bottom: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #374151;
`;

const ErrorSection = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: #fee2e2;
  border-radius: 6px;
  border: 1px solid #ef4444;
`;

const ErrorText = styled.div`
  color: #991b1b;
  font-weight: 500;
  margin-bottom: 4px;
`;

const RawData = styled.div`
  margin-top: 20px;
  
  pre {
    background: #1a202c;
    color: #10b981;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 0.85rem;
    line-height: 1.5;
  }
`;

export default AuthDebug;
