import { useState } from 'react'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiMail, FiArrowLeft } from 'react-icons/fi'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'

const Section = styled.section`
  padding: 120px 0 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
`

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
`

const FormCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #667eea;
  font-weight: 500;
  margin-bottom: 20px;
  
  &:hover {
    color: #5a6fd8;
  }
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #000;
`

const Subtitle = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const FormGroup = styled.div`
  position: relative;
`

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
`

const InputContainer = styled.div`
  position: relative;
`

const Input = styled.input<{ hasIcon?: boolean }>`
  width: 100%;
  padding: 14px 16px;
  padding-left: ${props => props.hasIcon ? '48px' : '16px'};
  border: 2px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #667eea;
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &.error {
    border-color: #e74c3c;
  }
`

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1.1rem;
`

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 4px;
  display: block;
`

const SuccessMessage = styled.div`
  background: #efe;
  color: #363;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 0.9rem;
`

const SubmitButton = styled(motion.button) <{ isLoading: boolean }>`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  border-radius: 12px;
  font-size: 1rem;
  margin-top: 10px;
  opacity: ${props => props.isLoading ? 0.7 : 1};
  cursor: ${props => props.isLoading ? 'not-allowed' : 'pointer'};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }
`

const LoginLink = styled.div`
  text-align: center;
  margin-top: 30px;
  color: #666;
  
  a {
    color: #667eea;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('Vui lòng nhập email')
      return
    }

    if (!validateEmail(email)) {
      setError('Email không hợp lệ')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) {
      setError('')
    }
  }

  return (
    <ProtectedRoute requireAuth={false}>
      <Layout>
        <NextSeo
          title="Quên mật khẩu - Fashion Store | Khôi phục tài khoản"
          description="Khôi phục mật khẩu tài khoản Fashion Store của bạn thông qua email."
          canonical="https://fashionstore.com/auth/forgot-password"
          openGraph={{
            title: 'Quên mật khẩu - Fashion Store',
            description: 'Khôi phục mật khẩu tài khoản Fashion Store.',
            url: 'https://fashionstore.com/auth/forgot-password',
          }}
        />

        <Section>
          <Container>
            <FormCard
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <BackButton href="/auth/login">
                <FiArrowLeft />
                Quay lại đăng nhập
              </BackButton>

              <Header>
                <Title>Quên mật khẩu?</Title>
                <Subtitle>
                  {success
                    ? 'Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email của bạn.'
                    : 'Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.'
                  }
                </Subtitle>
              </Header>

              {success ? (
                <SuccessMessage>
                  Email khôi phục mật khẩu đã được gửi đến <strong>{email}</strong>.
                  Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
                </SuccessMessage>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label>Email</Label>
                    <InputContainer>
                      <InputIcon>
                        <FiMail />
                      </InputIcon>
                      <Input
                        type="email"
                        value={email}
                        onChange={handleChange}
                        placeholder="Nhập email của bạn"
                        hasIcon
                        className={error ? 'error' : ''}
                      />
                    </InputContainer>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                  </FormGroup>

                  <SubmitButton
                    type="submit"
                    isLoading={isLoading}
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    {isLoading ? 'Đang gửi...' : 'Gửi hướng dẫn khôi phục'}
                  </SubmitButton>
                </Form>
              )}

              <LoginLink>
                Nhớ mật khẩu? <Link href="/auth/login">Đăng nhập ngay</Link>
              </LoginLink>
            </FormCard>
          </Container>
        </Section>
      </Layout>
    </ProtectedRoute>
  )
}