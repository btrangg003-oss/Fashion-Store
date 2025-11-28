import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Layout from '@/components/layout/Layout'
import VerificationForm from '@/components/Auth/VerificationForm'

const Container = styled.div`
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`

const Content = styled.div`
  width: 100%;
  max-width: 500px;
`

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 2rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`

const SuccessCard = styled.div`
  background: white;
  padding: 3rem 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
`

const SuccessIcon = styled.div`
  font-size: 4rem;
  color: #27ae60;
  margin-bottom: 1rem;
`

const SuccessTitle = styled.h2`
  color: #333;
  margin-bottom: 1rem;
`

const SuccessMessage = styled.p`
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
`

const ActionButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin: 0 0.5rem;
  
  &:hover {
    opacity: 0.9;
  }
`

export default function VerifyPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [verified, setVerified] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Get email from query params or localStorage
    const emailFromQuery = router.query.email as string
    const emailFromStorage = typeof window !== 'undefined' 
      ? localStorage.getItem('pendingVerificationEmail') 
      : null

    const emailToUse = emailFromQuery || emailFromStorage

    if (emailToUse) {
      setEmail(emailToUse)
    } else {
      // Redirect to register if no email found
      router.push('/auth/register')
    }
  }, [router.query.email, router])

  const handleVerificationSuccess = (data: any) => {
    setVerified(true)
    setUserData(data.user)
    
    // Clear pending email from storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pendingVerificationEmail')
    }
  }

  const handleVerificationError = (error: string) => {
    console.error('Verification error:', error)
  }

  const handleGoToLogin = () => {
    router.push('/auth/login')
  }

  const handleGoToProfile = () => {
    router.push('/profile')
  }

  const handleGoBack = () => {
    router.push('/auth/register')
  }

  if (!email) {
    return (
      <Layout>
        <Container>
          <Content>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <h2>Đang tải...</h2>
            </div>
          </Content>
        </Container>
      </Layout>
    )
  }

  if (verified) {
    return (
      <Layout>
        <Container>
          <Content>
            <SuccessCard>
              <SuccessIcon>🎉</SuccessIcon>
              <SuccessTitle>Xác thực thành công!</SuccessTitle>
              <SuccessMessage>
                Chào mừng <strong>{userData?.firstName} {userData?.lastName}</strong>!<br />
                Tài khoản của bạn đã được tạo thành công.<br />
                Bạn có thể đăng nhập và bắt đầu mua sắm ngay bây giờ.
              </SuccessMessage>
              <div>
                <ActionButton onClick={handleGoToLogin}>
                  Đăng nhập ngay
                </ActionButton>
                <ActionButton onClick={handleGoToProfile}>
                  Xem profile
                </ActionButton>
              </div>
            </SuccessCard>
          </Content>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container>
        <Content>
          <BackButton onClick={handleGoBack}>
            ← Quay lại đăng ký
          </BackButton>
          
          <VerificationForm
            email={email}
            onSuccess={handleVerificationSuccess}
            onError={handleVerificationError}
          />
        </Content>
      </Container>
    </Layout>
  )
}