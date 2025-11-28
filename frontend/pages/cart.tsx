import { NextSeo } from 'next-seo'
import Layout from '../src/components/layout/Layout'
import CartItems from '../src/components/Cart/CartItems'
import CartSummary from '../src/components/Cart/CartSummary'
import ProtectedRoute from '../src/components/Auth/ProtectedRoute'

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