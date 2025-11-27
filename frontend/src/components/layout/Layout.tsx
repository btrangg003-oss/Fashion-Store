import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import ChatbotWidget from '@/components/Chatbot/ChatbotWidget'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Header />
      <main style={{ minHeight: 'calc(100vh - 80px)' }}>
        {children}
      </main>
      <Footer />
      <ChatbotWidget />
    </>
  )
}

export default Layout