import { NextSeo } from 'next-seo'
import Layout from '../components/Layout/Layout'
import CartItems from '../components/Cart/CartItems'
import CartSummary from '../components/Cart/CartSummary'
import ProtectedRoute from '../components/Auth/ProtectedRoute'

export default function Cart() {
  return (
    <ProtectedRoute>
      <Layout>
        <NextSeo
          title="Giỏ hàng - Fashion Store | Thanh toán an toàn"
          description="Xem lại các sản phẩm trong giỏ hàng và tiến hành thanh toán an toàn tại Fashion Store. Miễn phí vận chuyển cho đơn hàng từ 500.000đ."
          canonical="https://fashionstore.com/cart"
          openGraph={{
            title: 'Giỏ hàng - Fashion Store',
            description: 'Xem lại các sản phẩm trong giỏ hàng và tiến hành thanh toán.',
            url: 'https://fashionstore.com/cart',
          }}
        />
        <CartItems />
        <CartSummary />
      </Layout>
    </ProtectedRoute>
  )
}