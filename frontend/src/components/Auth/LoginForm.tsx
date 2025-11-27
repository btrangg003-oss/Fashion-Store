import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiFacebook, FiGithub } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'

const Section = styled.section`
  padding: 120px 0 80px;
  background: #f8f9fa;
  min-height: 100vh;
  display: flex;
  align-items: center;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
`

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`

const FormSection = styled.div`
  padding: 60px;
  
  @media (max-width: 768px) {
    padding: 40px 30px;
  }
`

const ImageSection = styled.div`
  height: 100%;
  min-height: 600px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.9) 0%, rgba(255, 140, 66, 0.9) 100%),
              url('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px;
  color: white;
  text-align: center;
  
  @media (max-width: 968px) {
    display: none;
  }
`

const ImageLogo = styled.div`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 20px;
  letter-spacing: -1px;
`

const ImageTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 15px;
`

const ImageText = styled.p`
  font-size: 1.1rem;
  opacity: 0.95;
  line-height: 1.6;
  max-width: 400px;
`

const FormCard = styled(motion.div)`
  width: 100%;
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

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1.1rem;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 4px;
  display: block;
`

const ForgotPassword = styled(Link)`
  color: #667eea;
  font-size: 0.9rem;
  text-align: right;
  display: block;
  margin-top: 8px;
  
  &:hover {
    text-decoration: underline;
  }
`

const SubmitButton = styled(motion.button)<{ isLoading: boolean }>`
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 30px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #ddd;
  }
  
  span {
    padding: 0 20px;
    color: #666;
    font-size: 0.9rem;
  }
`

const SocialButtons = styled.div`
  display: flex;
  gap: 12px;
`

const SocialButton = styled(motion.button)`
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &.facebook {
    &:hover {
      border-color: #1877f2;
      color: #1877f2;
    }
  }
  
  &.google {
    &:hover {
      border-color: #db4437;
      color: #db4437;
    }
  }
`

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
`

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #667eea;
`

const CheckboxLabel = styled.label`
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
`

const ServerError = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 0.9rem;
`

const SignupLink = styled.div`
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

const LoginForm = () => {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [serverError, setServerError] = useState('')

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setServerError('')

    try {
      const result = await login(formData.email, formData.password, formData.rememberMe)
      
      if (result.success) {
        // Redirect to intended page or profile
        const redirectTo = router.query.redirect as string || '/profile'
        router.push(redirectTo)
      } else {
        // Handle different error types
        if (result.data?.code === 'ACCOUNT_NOT_VERIFIED') {
          // Redirect to verification page
          router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`)
        } else {
          setServerError(result.message || 'Đăng nhập thất bại')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setServerError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <Section>
      <Container>
        <TwoColumnLayout>
          <FormSection>
            <FormCard
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Header>
                <Title>Đăng nhập</Title>
                <Subtitle>Chào mừng bạn trở lại Fashion Store</Subtitle>
              </Header>

              <Form onSubmit={handleSubmit}>
            {serverError && <ServerError>{serverError}</ServerError>}
            
            <FormGroup>
              <Label>Email</Label>
              <InputContainer>
                <InputIcon>
                  <FiMail />
                </InputIcon>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email của bạn"
                  hasIcon
                  className={errors.email ? 'error' : ''}
                />
              </InputContainer>
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Mật khẩu</Label>
              <InputContainer>
                <InputIcon>
                  <FiLock />
                </InputIcon>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  hasIcon
                  className={errors.password ? 'error' : ''}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </PasswordToggle>
              </InputContainer>
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
              <ForgotPassword href="/auth/forgot-password">
                Quên mật khẩu?
              </ForgotPassword>
            </FormGroup>

            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
              />
              <CheckboxLabel htmlFor="rememberMe">
                Ghi nhớ đăng nhập
              </CheckboxLabel>
            </CheckboxContainer>

            <SubmitButton
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </SubmitButton>
          </Form>

          <Divider>
            <span>Hoặc đăng nhập với</span>
          </Divider>

          <SocialButtons>
            <SocialButton
              className="facebook"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiFacebook />
              Facebook
            </SocialButton>
            <SocialButton
              className="google"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiGithub />
              Google
            </SocialButton>
          </SocialButtons>

          <SignupLink>
            Chưa có tài khoản? <Link href="/auth/register">Đăng ký ngay</Link>
          </SignupLink>
            </FormCard>
          </FormSection>
          
          <ImageSection>
            <ImageLogo>FASHION</ImageLogo>
            <ImageTitle>Fashion Store</ImageTitle>
            <ImageText>
              Khám phá bộ sưu tập thời trang cao cấp mới nhất. 
              Miễn phí vận chuyển, đổi hàng 15 ngày, thanh toán COD.
            </ImageText>
          </ImageSection>
        </TwoColumnLayout>
      </Container>
    </Section>
  )
}

export default LoginForm