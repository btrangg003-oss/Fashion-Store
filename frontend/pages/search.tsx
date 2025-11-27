import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import Layout from '../components/Layout/Layout'
import SearchResults from '../components/Search/SearchResults'
import SearchFilters from '../components/Search/SearchFilters'

export default function Search() {
  const router = useRouter()
  const { q } = router.query
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (q && typeof q === 'string') {
      setSearchQuery(q)
    }
  }, [q])

  return (
    <Layout>
      <NextSeo
        title={`Tìm kiếm: ${searchQuery || 'Sản phẩm'} - Fashion Store`}
        description={`Kết quả tìm kiếm cho "${searchQuery}". Khám phá các sản phẩm thời trang phù hợp với từ khóa của bạn.`}
        canonical={`https://fashionstore.com/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
        openGraph={{
          title: `Tìm kiếm: ${searchQuery || 'Sản phẩm'} - Fashion Store`,
          description: `Kết quả tìm kiếm cho "${searchQuery}".`,
          url: `https://fashionstore.com/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
        }}
      />
      <SearchFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <SearchResults searchQuery={searchQuery} />
    </Layout>
  )
}