import { NextSeo } from 'next-seo'
import Layout from '../components/Layout/Layout'
import Hero from '../components/Home/Hero'
import FeaturedProducts from '../components/Home/FeaturedProducts'
import NewProducts from '../components/Home/NewProducts'
import SaleProducts from '../components/Home/SaleProducts'
import Collections from '../components/Home/Collections'
import Newsletter from '../components/Home/Newsletter'

export default function Home() {
  return (
    <Layout>
      <NextSeo
        title="Fashion Store - Thời Trang Cao Cấp | Trang chủ"
        description="Khám phá bộ sưu tập thời trang cao cấp mới nhất tại Fashion Store. Áo quần, phụ kiện thời trang chất lượng với giá tốt nhất."
        canonical="https://fashionstore.com"
        openGraph={{
          title: 'Fashion Store - Thời Trang Cao Cấp',
          description: 'Khám phá bộ sưu tập thời trang cao cấp mới nhất tại Fashion Store.',
          url: 'https://fashionstore.com',
          images: [
            {
              url: 'https://fashionstore.com/og-home.jpg',
              width: 1200,
              height: 630,
              alt: 'Fashion Store Homepage',
            },
          ],
        }}
      />
      <Hero />
      <NewProducts />
      <SaleProducts />
      <FeaturedProducts />
      <Collections />
      <Newsletter />
    </Layout>
  )
}