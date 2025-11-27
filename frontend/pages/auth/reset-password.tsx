import { useState, useEffect } from 'react'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiLock, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi'
import Layout from '../../components/Layout/Layout'
import ProtectedRoute from '../../components/Auth/ProtectedRoute'

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
  padding-right: ${props => props.type === 'password' ? '48px' : '16px'};
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
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.1rem;

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

const TokenError = styled.div`
  background: #fee;
  color: #c33;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 0.9rem;
`

export default function ResetPassword() {
    const router = useRouter()
    const { token } = router.query

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [tokenValid, setTokenValid] = useState<boolean | null>(null)

    useEffect(() => {
        if (token && typeof token === 'string') {
            // Validate token format (basic check)
            if (token.length < 10) {
                setTokenValid(false)
                setError('Token không hợp lệ')
            } else {
                setTokenValid(true)
            }
        }
    }, [token])

    const validatePassword = (password: string) => {
        return password.length >= 6
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!password.trim()) {
            setError('Vui lòng nhập mật khẩu mới')
            return
        }

        if (!validatePassword(password)) {
            setError('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp')
            return
        }

        if (!token || typeof token !== 'string') {
            setError('Token không hợp lệ')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword: password }),
            })

            const data = await response.json()

            if (data.success) {
                setSuccess(true)
            } else {
                setError(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
            }
        } catch (error) {
            console.error('Reset password error:', error)
            setError('Có lỗi xảy ra. Vui lòng thử lại.')
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
        if (error) {
            setError('')
        }
    }

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value)
        if (error) {
            setError('')
        }
    }

    if (tokenValid === false) {
        return (
            <ProtectedRoute requireAuth={false}>
                <Layout>
                    <NextSeo
                        title="Đặt lại mật khẩu - Fashion Store"
                        description="Đặt lại mật khẩu tài khoản Fashion Store của bạn."
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
                                    <Title>Đặt lại mật khẩu</Title>
                                </Header>

                                <TokenError>
                                    Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                                    Vui lòng yêu cầu link mới.
                                </TokenError>

                                <LoginLink>
                                    <Link href="/auth/forgot-password">Yêu cầu link mới</Link>
                                </LoginLink>
                            </FormCard>
                        </Container>
                    </Section>
                </Layout>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute requireAuth={false}>
            <Layout>
                <NextSeo
                    title="Đặt lại mật khẩu - Fashion Store"
                    description="Đặt lại mật khẩu tài khoản Fashion Store của bạn."
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
                                <Title>Đặt lại mật khẩu</Title>
                                <Subtitle>
                                    {success
                                        ? 'Mật khẩu đã được đặt lại thành công!'
                                        : 'Nhập mật khẩu mới cho tài khoản của bạn.'
                                    }
                                </Subtitle>
                            </Header>

                            {success ? (
                                <SuccessMessage>
                                    Mật khẩu của bạn đã được đặt lại thành công.
                                    Bây giờ bạn có thể <Link href="/auth/login">đăng nhập</Link> với mật khẩu mới.
                                </SuccessMessage>
                            ) : (
                                <Form onSubmit={handleSubmit}>
                                    <FormGroup>
                                        <Label>Mật khẩu mới</Label>
                                        <InputContainer>
                                            <InputIcon>
                                                <FiLock />
                                            </InputIcon>
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={handlePasswordChange}
                                                placeholder="Nhập mật khẩu mới"
                                                hasIcon
                                                className={error ? 'error' : ''}
                                            />
                                            <PasswordToggle
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FiEyeOff /> : <FiEye />}
                                            </PasswordToggle>
                                        </InputContainer>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label>Xác nhận mật khẩu</Label>
                                        <InputContainer>
                                            <InputIcon>
                                                <FiLock />
                                            </InputIcon>
                                            <Input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={handleConfirmPasswordChange}
                                                placeholder="Nhập lại mật khẩu mới"
                                                hasIcon
                                                className={error ? 'error' : ''}
                                            />
                                            <PasswordToggle
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                            </PasswordToggle>
                                        </InputContainer>
                                        {error && <ErrorMessage>{error}</ErrorMessage>}
                                    </FormGroup>

                                    <SubmitButton
                                        type="submit"
                                        isLoading={isLoading}
                                        disabled={isLoading || !tokenValid}
                                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                    >
                                        {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
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
