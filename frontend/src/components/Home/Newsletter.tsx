import { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'

const Section = styled.section`
  padding: 100px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
`

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`

const NewsletterForm = styled(motion.form)`
  display: flex;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const EmailInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  outline: none;
  
  &::placeholder {
    color: #999;
  }
  
  &:focus {
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  }
`

const SubmitButton = styled.button`
  padding: 1rem 2rem;
  background: #000;
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: #333;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const Benefits = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`

const Benefit = styled.div`
  text-align: center;
  
  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.9rem;
    opacity: 0.8;
    line-height: 1.5;
  }
`

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      
      if (data.success) {
        setIsSubmitted(true)
        setEmail('')
        // Reset success message after 3 seconds
        setTimeout(() => setIsSubmitted(false), 3000)
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Section>
      <Container>
        <Title>Đăng ký nhận tin tức</Title>
        <Subtitle>
          Nhận thông báo về sản phẩm mới, ưu đãi đặc biệt và xu hướng thời trang mới nhất
        </Subtitle>
        
        {!isSubmitted ? (
          <NewsletterForm
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <EmailInput
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang gửi...' : 'Đăng ký'}
            </SubmitButton>
          </NewsletterForm>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '1rem 2rem',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50px',
              display: 'inline-block',
              fontWeight: 600
            }}
          >
            ✓ Cảm ơn bạn đã đăng ký!
          </motion.div>
        )}
        
        <Benefits
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Benefit>
            <h4>Sản phẩm mới</h4>
            <p>Được thông báo đầu tiên về các sản phẩm mới nhất</p>
          </Benefit>
          <Benefit>
            <h4>Ưu đãi độc quyền</h4>
            <p>Nhận mã giảm giá và ưu đãi đặc biệt chỉ dành cho thành viên</p>
          </Benefit>
          <Benefit>
            <h4>Xu hướng thời trang</h4>
            <p>Cập nhật những xu hướng thời trang mới nhất từ khắp thế giới</p>
          </Benefit>
        </Benefits>
      </Container>
    </Section>
  )
}

export default Newsletter