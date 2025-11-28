import { NextSeo } from 'next-seo'
import Layout from '@/components/layout/Layout'
import AboutHero from '@/components/About/AboutHero'
import AboutStory from '@/components/About/AboutStory'
import AboutTeam from '@/components/About/AboutTeam'
import AboutValues from '@/components/About/AboutValues'

export default function About() {
  return (
    <Layout>
      <NextSeo
        title="Về chúng tôi - Fashion Store | Câu chuyện thương hiệu"
        description="Tìm hiểu về Fashion Store - thương hiệu thời trang hàng đầu Việt Nam với sứ mệnh mang đến phong cách thời trang đẳng cấp cho mọi người."
        canonical="https://fashionstore.com/about"
        openGraph={{
          title: 'Về chúng tôi - Fashion Store',
          description: 'Tìm hiểu về Fashion Store - thương hiệu thời trang hàng đầu Việt Nam.',
          url: 'https://fashionstore.com/about',
        }}
      />
      <AboutHero />
      <AboutStory />
      <AboutValues />
      <AboutTeam />
    </Layout>
  )
}