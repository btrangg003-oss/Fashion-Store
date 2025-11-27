import { NextSeo } from 'next-seo'
import Layout from '../../components/Layout/Layout'
import RegisterForm from '../../components/Auth/RegisterForm'
import ProtectedRoute from '../../components/Auth/ProtectedRoute'

export default function Register() {
  return (
    <ProtectedRoute requireAuth={false}>
      <Layout>
        <NextSeo
          title="Đăng ký tài khoản - Fashion Store | Tạo tài khoản mới"
          description="Tạo tài khoản Fashion Store để trải nghiệm mua sắm cá nhân hóa và nhận được những ưu đãi đặc biệt."
          canonical="https://fashionstore.com/auth/register"
          openGraph={{
            title: 'Đăng ký tài khoản - Fashion Store',
            description: 'Tạo tài khoản Fashion Store mới.',
            url: 'https://fashionstore.com/auth/register',
          }}
        />
        <RegisterForm />
      </Layout>
    </ProtectedRoute>
  )
}