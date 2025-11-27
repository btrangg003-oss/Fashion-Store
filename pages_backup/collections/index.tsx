import { NextSeo } from 'next-seo'
import Layout from '../../components/Layout/Layout'
import CollectionsHero from '../../components/Collections/CollectionsHero'
import CollectionsGrid from '../../components/Collections/CollectionsGrid'

export default function Collections() {
  return (
    <Layout>
      <NextSeo
        title="Bộ sưu tập thời trang - Fashion Store | Xu hướng mới nhất"
        description="Khám phá các bộ sưu tập thời trang độc đáo tại Fashion Store. Từ thời trang công sở đến dạ tiệc, chúng tôi có tất cả cho phong cách của bạn."
        canonical="https://fashionstore.com/collections"
        openGraph={{
          title: 'Bộ sưu tập thời trang - Fashion Store',
          description: 'Khám phá các bộ sưu tập thời trang độc đáo tại Fashion Store.',
          url: 'https://fashionstore.com/collections',
        }}
      />
      <CollectionsHero />
      <CollectionsGrid />
    </Layout>
  )
}