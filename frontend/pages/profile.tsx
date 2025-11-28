import { NextSeo } from 'next-seo'
import Layout from '@/components/layout/Layout'
import ProfileContent from '@/components/Profile/ProfileContent'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'

export default function Profile() {
  return (
    <ProtectedRoute>
      <Layout>
        <NextSeo
          title="Tài khoản của tôi - Fashion Store | Quản lý thông tin cá nhân"
          description="Quản lý thông tin tài khoản, xem lịch sử đơn hàng và cập nhật thông tin cá nhân tại Fashion Store."
          canonical="https://fashionstore.com/profile"
          noindex={true}
          nofollow={true}
          openGraph={{
            title: 'Tài khoản của tôi - Fashion Store',
            description: 'Quản lý thông tin tài khoản và đơn hàng.',
            url: 'https://fashionstore.com/profile',
          }}
        />
        <ProfileContent />
      </Layout>
    </ProtectedRoute>
  )
}