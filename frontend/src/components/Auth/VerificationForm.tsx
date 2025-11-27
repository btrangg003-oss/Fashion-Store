import { useState, useEffect } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
`

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin-bottom: 1rem;
`

const Description = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const CodeInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 1rem 0;
`

const CodeInput = styled.input`
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  border: 2px solid #ddd;
  border-radius: 8px;
  outline: none;
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &.error {
    border-color: #e74c3c;
  }
  
  &.success {
    border-color: #27ae60;
  }
`

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'secondary' ? `
    background: #f8f9fa;
    color: #667eea;
    border: 1px solid #667eea;
    
    &:hover {
      background: #667eea;
      color: white;
    }
  ` : `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      opacity: 0.9;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const Timer = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin: 1rem 0;
`

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 5px;
  text-align: center;
  margin: 1rem 0;
`

const SuccessMessage = styled.div`
  background: #efe;
  color: #363;
  padding: 0.75rem;
  border-radius: 5px;
  text-align: center;
  margin: 1rem 0;
`

const ResendSection = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
`

interface VerificationFormProps {
  email: string
  onSuccess?: (userData: any) => void
  onError?: (error: string) => void
}

export default function VerificationForm({ email, onSuccess, onError }: VerificationFormProps) {
  const [code, setCode] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [canResend, setCanResend] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [attemptsLeft, setAttemptsLeft] = useState(5)

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
    
    // Auto-submit when all 4 digits are entered
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 4) {
      handleSubmit(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = async (verificationCode?: string) => {
    const codeToSubmit = verificationCode || code.join('')
    
    if (codeToSubmit.length !== 4) {
      setError('Vui lòng nhập đầy đủ 4 chữ số')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          verificationCode: codeToSubmit
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Xác thực thành công! Tài khoản của bạn đã được tạo.')
        onSuccess?.(data.data)
      } else {
        setError(data.message)
        if (data.attemptsLeft !== undefined) {
          setAttemptsLeft(data.attemptsLeft)
        }
        onError?.(data.message)
        
        // Clear code inputs on error
        setCode(['', '', '', ''])
        const firstInput = document.getElementById('code-0')
        firstInput?.focus()
      }
    } catch (error) {
      const errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Mã xác thực mới đã được gửi đến email của bạn.')
        setTimeLeft(600) // Reset timer
        setCanResend(false)
        setResendCooldown(60) // 1 minute cooldown
        setAttemptsLeft(5) // Reset attempts
        setCode(['', '', '', '']) // Clear inputs
      } else {
        setError(data.message)
        if (data.remainingTime) {
          setResendCooldown(data.remainingTime)
        }
      }
    } catch (error) {
      setError('Không thể gửi lại mã xác thực. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Container>
      <Title>Xác thực Email</Title>
      <Description>
        Chúng tôi đã gửi mã xác thực 4 chữ số đến email:<br />
        <strong>{email}</strong>
      </Description>

      <Form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
        <CodeInputContainer>
          {code.map((digit, index) => (
            <CodeInput
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={error ? 'error' : success ? 'success' : ''}
              disabled={loading}
            />
          ))}
        </CodeInputContainer>

        {timeLeft > 0 && (
          <Timer>
            Mã sẽ hết hạn sau: <strong>{formatTime(timeLeft)}</strong>
          </Timer>
        )}

        {attemptsLeft < 5 && (
          <Timer>
            Còn lại <strong>{attemptsLeft}</strong> lần thử
          </Timer>
        )}

        <Button 
          type="submit" 
          disabled={loading || code.some(digit => !digit)}
        >
          {loading ? 'Đang xác thực...' : 'Xác thực'}
        </Button>
      </Form>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <ResendSection>
        <p>Không nhận được mã?</p>
        <Button
          type="button"
          variant="secondary"
          onClick={handleResend}
          disabled={loading || (!canResend && resendCooldown === 0) || resendCooldown > 0}
        >
          {resendCooldown > 0 
            ? `Gửi lại sau ${resendCooldown}s`
            : loading 
              ? 'Đang gửi...' 
              : 'Gửi lại mã'
          }
        </Button>
      </ResendSection>
    </Container>
  )
}