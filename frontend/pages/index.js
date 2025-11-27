import LayoutSimple from '../src/components/layout/LayoutSimple'
import HeroBannerSlider from '../src/components/Home/HeroBannerSlider'
import ServiceFeatures from '../src/components/Home/ServiceFeatures'
import MiniCollections from '../src/components/Home/MiniCollections'
import CategoryGrid from '../src/components/Home/CategoryGrid'
import FlashSale from '../src/components/Home/FlashSale'
import DefaultVouchers from '../src/components/Home/DefaultVouchers'
import NewArrivals from '../src/components/Home/NewArrivals'
import ProductTabs from '../src/components/Home/ProductTabs'
import DoubleBanner from '../src/components/Home/DoubleBanner'
import DressCategory from '../src/components/Home/DressCategory'
import NewCollectionLaunch from '../src/components/Home/NewCollectionLaunch'
import PopularProducts from '../src/components/Home/PopularProducts'
import MixMatchCombo from '../src/components/Home/MixMatchCombo'
import CustomerReviews from '../src/components/Home/CustomerReviews'
import SocialMedia from '../src/components/Home/SocialMedia'
import LatestNews from '../src/components/Home/LatestNews'

export default function HomePage() {
  return (
    <LayoutSimple>
      {/* Hero Banner Slider - 4 banners */}
      <HeroBannerSlider />
      
      {/* Service Features - Miễn phí vận chuyển, Đổi hàng, COD, Hotline */}
      <ServiceFeatures />
      
      {/* Mini Collections - 4 bộ sưu tập */}
      <MiniCollections />
      
      {/* Category Grid - Danh mục nổi bật với số lượng */}
      <CategoryGrid />
      
      {/* Flash Sale - Với bộ đếm ngược */}
      <FlashSale />
      
      {/* Default Vouchers - 4 voucher mặc định */}
      <DefaultVouchers />
      
      {/* New Arrivals - Hàng mới về */}
      <NewArrivals />
      
      {/* Product Tabs - Tất cả sản phẩm với 3 tabs */}
      <ProductTabs />
      
      {/* Double Banner - 2 banner quảng cáo */}
      <DoubleBanner />
      
      {/* Dress Category - Váy đầm với các loại */}
      <DressCategory />
      
      {/* New Collection Launch - Ra mắt bộ sưu tập Giáng sinh */}
      <NewCollectionLaunch />
      
      {/* Popular Products - Sản phẩm phổ biến */}
      <PopularProducts />
      
      {/* Mix & Match Combo - Combo trang phục */}
      <MixMatchCombo />
      
      {/* Customer Reviews - Đánh giá khách hàng */}
      <CustomerReviews />
      
      {/* Social Media - TikTok */}
      <SocialMedia />
      
      {/* Latest News - Tin tức mới nhất */}
      <LatestNews />
    </LayoutSimple>
  )
}
