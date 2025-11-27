import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingCart, FiMinus, FiPlus, FiShare2, FiTruck, FiShield, FiRotateCcw, FiStar } from 'react-icons/fi'

interface Product {
  id: number
  name: string
  brand: string
  currentPrice: string
  originalPrice: string
  discount: string
  description: string
  features: string[]
  sizes: string[]
  colors: string[]
  images: string[]
  category: string
  rating: number
  reviews: number
  // New fields
  material?: string
  origin?: string
  careInstructions?: string
}

interface ProductDetailProps {
  product: Product
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 20px 80px;
`

const ProductContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  margin-bottom: 80px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`

const ImageSection = styled.div`
  position: sticky;
  top: 120px;
  height: fit-content;
`

const MainImage = styled(motion.div)`
  position: relative;
  height: 600px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
  cursor: zoom-in;
  
  @media (max-width: 768px) {
    height: 400px;
  }
`

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
`

const Thumbnail = styled(motion.div)<{ $isActive: boolean }>`
  position: relative;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.$isActive ? '#000' : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #000;
  }
`

const ProductInfo = styled.div``

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: #666;
  
  a {
    color: #666;
    transition: color 0.3s ease;
    
    &:hover {
      color: #000;
    }
  }
  
  span {
    color: #ccc;
  }
`

const Brand = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
`

const ProductName = styled(motion.h1)`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
`

const Stars = styled.div`
  display: flex;
  gap: 2px;
`

const Star = styled(FiStar)<{ filled: boolean }>`
  color: ${props => props.filled ? '#ffc107' : '#ddd'};
  fill: ${props => props.filled ? '#ffc107' : 'none'};
`

const ReviewCount = styled.span`
  color: #666;
  font-size: 0.9rem;
`

const PriceSection = styled.div`
  margin-bottom: 30px;
`

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
`

const CurrentPrice = styled.span`
  font-size: 2rem;
  font-weight: 700;
  color: #e74c3c;
`

const OriginalPrice = styled.span`
  font-size: 1.2rem;
  color: #999;
  text-decoration: line-through;
`

const Discount = styled.span`
  background: #e74c3c;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
`

const Description = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
`

const OptionsSection = styled.div`
  margin-bottom: 30px;
`

const OptionGroup = styled.div`
  margin-bottom: 24px;
`

const OptionLabel = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #000;
`

const SizeOptions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const SizeOption = styled(motion.button)<{ $isSelected: boolean }>`
  padding: 12px 16px;
  border: 2px solid ${props => props.$isSelected ? '#000' : '#ddd'};
  background: ${props => props.$isSelected ? '#000' : 'white'};
  color: ${props => props.$isSelected ? 'white' : '#000'};
  border-radius: 8px;
  font-weight: 500;
  min-width: 50px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #000;
  }
`

const ColorOptions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`

const ColorOption = styled(motion.button)<{ color: string; $isSelected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid ${props => props.$isSelected ? '#000' : '#ddd'};
  background: ${props => {
    const colorMap: { [key: string]: string } = {
      'Trắng': '#ffffff',
      'Đen': '#000000',
      'Xanh nhạt': '#87ceeb',
      'Hồng nhạt': '#ffb6c1',
      'Đỏ burgundy': '#800020',
      'Xanh navy': '#000080'
    }
    return colorMap[props.color] || '#ccc'
  }};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #000;
    transform: scale(1.1);
  }
`

const QuantitySection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`

const QuantityLabel = styled.span`
  font-weight: 600;
`

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
`

const QuantityButton = styled.button`
  padding: 12px 16px;
  background: #f8f9fa;
  border: none;
  color: #333;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e9ecef;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const QuantityDisplay = styled.span`
  padding: 12px 20px;
  background: white;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const AddToCartButton = styled(motion.button)<{ disabled?: boolean }>`
  flex: 1;
  padding: 16px 24px;
  background: ${props => props.disabled ? '#ccc' : '#000'};
  color: ${props => props.disabled ? '#666' : 'white'};
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.disabled ? '#ccc' : '#333'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
  }
`

const BuyNowButton = styled(motion.button)<{ disabled?: boolean }>`
  flex: 1;
  padding: 16px 24px;
  background: ${props => props.disabled ? '#ccc' : '#ee4d2d'};
  color: ${props => props.disabled ? '#666' : 'white'};
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.disabled ? '#ccc' : '#d73527'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
  }
`

const WishlistButton = styled(motion.button)`
  padding: 16px;
  border: 2px solid #ddd;
  background: white;
  color: #333;
  border-radius: 8px;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #e74c3c;
    color: #e74c3c;
    transform: translateY(-2px);
  }
`

const ShareButton = styled(motion.button)`
  padding: 16px;
  border: 2px solid #ddd;
  background: white;
  color: #333;
  border-radius: 8px;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #007bff;
    color: #007bff;
    transform: translateY(-2px);
  }
`

const Features = styled.div`
  border-top: 1px solid #eee;
  padding-top: 30px;
  margin-bottom: 30px;
`

const FeaturesList = styled.ul`
  list-style: none;
  
  li {
    padding: 8px 0;
    color: #666;
    position: relative;
    padding-left: 20px;
    
    &::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #28a745;
      font-weight: bold;
    }
  }
`

const Specifications = styled.div`
  border-top: 1px solid #eee;
  padding-top: 30px;
  margin-bottom: 30px;
`

const SpecsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const SpecItem = styled.div`
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`

const SpecLabel = styled.div`
  min-width: 180px;
  font-weight: 600;
  color: #333;
`

const SpecValue = styled.div`
  flex: 1;
  color: #666;
  line-height: 1.6;
`

const ServiceInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 12px;
`

const ServiceItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #28a745;
    font-size: 1.5rem;
  }
  
  div {
    h5 {
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    p {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
    }
  }
`

const ProductDetail = ({ product }: ProductDetailProps) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  const parsePriceToNumber = (priceText: string): number => {
    const digits = (priceText || '').toString().replace(/[^0-9]/g, '')
    return digits ? parseInt(digits, 10) : 0
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star key={index} filled={index < Math.floor(rating)} />
    ))
  }

  return (
    <Container>
      <ProductContainer>
        <ImageSection>
          <MainImage
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              style={{ objectFit: 'contain' }}
              quality={100}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </MainImage>
          
          <ThumbnailGrid>
            {product.images.map((image, index) => (
              <Thumbnail
                key={index}
                $isActive={selectedImage === index}
                onClick={() => setSelectedImage(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  quality={90}
                  sizes="80px"
                />
              </Thumbnail>
            ))}
          </ThumbnailGrid>
        </ImageSection>

        <ProductInfo>
          <Breadcrumb>
            <Link href="/">Trang chủ</Link>
            <span>/</span>
            <Link href="/products">Sản phẩm</Link>
            <span>/</span>
            <span>{product.category}</span>
          </Breadcrumb>

          <Brand>{product.brand}</Brand>
          
          <ProductName
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {product.name}
          </ProductName>

          <Rating>
            <Stars>{renderStars(product.rating)}</Stars>
            <ReviewCount>({product.reviews} đánh giá)</ReviewCount>
          </Rating>

          <PriceSection>
            <PriceContainer>
              <CurrentPrice>{product.currentPrice}</CurrentPrice>
              <OriginalPrice>{product.originalPrice}</OriginalPrice>
              <Discount>{product.discount}</Discount>
            </PriceContainer>
          </PriceSection>

          <Description>{product.description}</Description>

          <OptionsSection>
            <OptionGroup>
              <OptionLabel>Kích thước:</OptionLabel>
              <SizeOptions>
                {product.sizes.map((size) => (
                  <SizeOption
                    key={size}
                    $isSelected={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {size}
                  </SizeOption>
                ))}
              </SizeOptions>
            </OptionGroup>

            <OptionGroup>
              <OptionLabel>Màu sắc:</OptionLabel>
              <ColorOptions>
                {product.colors.map((color) => (
                  <ColorOption
                    key={color}
                    color={color}
                    $isSelected={selectedColor === color}
                    onClick={() => setSelectedColor(color)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={color}
                  />
                ))}
              </ColorOptions>
            </OptionGroup>
          </OptionsSection>

          <QuantitySection>
            <QuantityLabel>Số lượng:</QuantityLabel>
            <QuantityControls>
              <QuantityButton
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <FiMinus />
              </QuantityButton>
              <QuantityDisplay>{quantity}</QuantityDisplay>
              <QuantityButton
                onClick={() => setQuantity(quantity + 1)}
              >
                <FiPlus />
              </QuantityButton>
            </QuantityControls>
          </QuantitySection>

          <ActionButtons>
            <AddToCartButton
              disabled={!selectedSize || !selectedColor}
              whileHover={{ scale: (!selectedSize || !selectedColor) ? 1 : 1.02 }}
              whileTap={{ scale: (!selectedSize || !selectedColor) ? 1 : 0.98 }}
              onClick={() => {
                if (!selectedSize || !selectedColor) return
                try {
                  const cartRaw = typeof window !== 'undefined' ? localStorage.getItem('cart') : null
                  const cart = cartRaw ? JSON.parse(cartRaw) : []
                  const item = {
                    id: product.id,
                    name: product.name,
                    size: selectedSize,
                    color: selectedColor,
                    quantity,
                    price: parsePriceToNumber(product.currentPrice),
                    image: product.images[0],
                    brand: product.brand,
                    displayPrice: product.currentPrice,
                    displayOriginalPrice: product.originalPrice
                  }
                  cart.push(item)
                  localStorage.setItem('cart', JSON.stringify(cart))
                  alert('Sản phẩm đã được thêm vào giỏ hàng!')
                } catch (e) {
                  console.error('Add to cart failed:', e)
                }
              }}
            >
              <FiShoppingCart />
              Thêm vào giỏ hàng
            </AddToCartButton>
            <BuyNowButton
              disabled={!selectedSize || !selectedColor}
              whileHover={{ scale: (!selectedSize || !selectedColor) ? 1 : 1.02 }}
              whileTap={{ scale: (!selectedSize || !selectedColor) ? 1 : 0.98 }}
              onClick={() => {
                if (!selectedSize || !selectedColor) return
                try {
                  const item = {
                    id: product.id,
                    name: product.name,
                    size: selectedSize,
                    color: selectedColor,
                    quantity,
                    price: parsePriceToNumber(product.currentPrice),
                    image: product.images[0]
                  }
                  localStorage.setItem('buyNow', JSON.stringify([item]))
                  window.location.href = '/checkout'
                } catch (e) {
                  console.error('Buy now failed:', e)
                }
              }}
            >
              Mua ngay
            </BuyNowButton>
            <WishlistButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiHeart />
            </WishlistButton>
            <ShareButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiShare2 />
            </ShareButton>
          </ActionButtons>

          <Features>
            <OptionLabel>Đặc điểm nổi bật:</OptionLabel>
            <FeaturesList>
              {product.features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {feature}
                </motion.li>
              ))}
            </FeaturesList>
          </Features>

          {(product.brand || product.material || product.origin || product.careInstructions) && (
            <Specifications>
              <OptionLabel>Thông số kỹ thuật:</OptionLabel>
              <SpecsList>
                {product.brand && (
                  <SpecItem>
                    <SpecLabel>Thương hiệu:</SpecLabel>
                    <SpecValue>{product.brand}</SpecValue>
                  </SpecItem>
                )}
                {product.material && (
                  <SpecItem>
                    <SpecLabel>Chất liệu:</SpecLabel>
                    <SpecValue>{product.material}</SpecValue>
                  </SpecItem>
                )}
                {product.origin && (
                  <SpecItem>
                    <SpecLabel>Xuất xứ:</SpecLabel>
                    <SpecValue>{product.origin}</SpecValue>
                  </SpecItem>
                )}
                {product.careInstructions && (
                  <SpecItem>
                    <SpecLabel>Hướng dẫn bảo quản:</SpecLabel>
                    <SpecValue>{product.careInstructions}</SpecValue>
                  </SpecItem>
                )}
              </SpecsList>
            </Specifications>
          )}

          <ServiceInfo>
            <ServiceItem>
              <FiTruck />
              <div>
                <h5>Miễn phí vận chuyển</h5>
                <p>Đơn hàng từ 500.000đ</p>
              </div>
            </ServiceItem>
            <ServiceItem>
              <FiRotateCcw />
              <div>
                <h5>Đổi trả dễ dàng</h5>
                <p>Trong vòng 30 ngày</p>
              </div>
            </ServiceItem>
            <ServiceItem>
              <FiShield />
              <div>
                <h5>Bảo hành chất lượng</h5>
                <p>Cam kết chính hãng</p>
              </div>
            </ServiceItem>
          </ServiceInfo>
        </ProductInfo>
      </ProductContainer>
    </Container>
  )
}

export default ProductDetail