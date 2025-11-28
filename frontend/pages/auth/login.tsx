import { NextSeo } from 'next-seo'
import Layout from '@/components/layout/Layout'
import LoginForm from '@/components/Auth/LoginForm'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'

export default function Login() {
  return (
    <ProtectedRoute requireAuth={false}>
      <Layout>
        <NextSeo
          title="Đăng nhập - Fashion Store | Truy cập tài khoản"
          description="Đăng nhập vào tài khoản Fashion Store để trải nghiệm mua sắm cá nhân hóa và theo dõi đơn hàng của bạn."
          canonical="https://fashionstore.com/auth/login"
          openGraph={{
            title: 'Đăng nhập - Fashion Store',
            description: 'Đăng nhập vào tài khoản Fashion Store.',
            url: 'https://fashionstore.com/auth/login',
          }}
        />
        <LoginForm />
      </Layout>
    </ProtectedRoute>
  )
}