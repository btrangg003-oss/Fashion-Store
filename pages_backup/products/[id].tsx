import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import ProductReviews from '@/components/Products/ProductReviews';
import { FiShoppingCart, FiHeart, FiShare2, FiStar, FiMinus, FiPlus } from 'react-icons/fi';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  stock: number;
  sizes?: string[];
  colors?: string[];
  rating?: number;
  reviews?: number;
  specifications?: { [key: string]: string };
}

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchRelatedProducts();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) {
        throw new Error('Product not found');
      }
      const data = await res.json();
      
      // Transform data to match Product interface
      const transformedProduct = {
        id: data.id,
        name: data.name,
        description: data.description || 'Không có mô tả',
        price: data.price,
        salePrice: data.comparePrice,
        images: data.images || [],
        category: data.categoryId || data.category || 'Thời trang',
        stock: data.stock || 0,
        sizes: data.variants?.map((v: any) => v.options?.find((o: any) => o.name === 'Size')?.value).filter(Boolean) || [],
        colors: data.variants?.map((v: any) => v.options?.find((o: any) => o.name === 'Màu sắc')?.value).filter(Boolean) || [],
        rating: 4.5,
        reviews: 128,
        specifications: {
          'Chất liệu': 'Cotton 100%',
          'Xuất xứ': 'Việt Nam',
          'Thương hiệu': data.vendor || 'Fashion Store',
          'SKU': data.sku || data.id,
          ...data.specifications
        }
      };
      
      setProduct(transformedProduct);
      
      // ✅ KHÔNG tự động chọn - bắt buộc user phải chọn
      // Để trống để user phải chọn
      setSelectedSize('');
      setSelectedColor('');
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      const products = data.products || data.data || [];
      
      // Transform and limit to 4
      const transformed = products.slice(0, 4).map((p: any) => {
        // ✅ Xử lý images đúng cách
        let imageUrl = 'https://via.placeholder.com/300x300?text=No+Image';
        if (p.images && Array.isArray(p.images) && p.images.length > 0) {
          imageUrl = p.images[0];
        } else if (p.image) {
          imageUrl = p.image;
        } else if (p.imageUrl) {
          imageUrl = p.imageUrl;
        }

        return {
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          salePrice: p.comparePrice,
          images: [imageUrl], // ✅ Luôn có ít nhất 1 ảnh
          category: p.categoryId || p.category || 'Thời trang',
          stock: p.stock || 0,
        };
      });
      
      setRelatedProducts(transformed);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = () => {
    // ✅ Validation: Chỉ validate nếu sản phẩm CÓ variants
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Vui lòng chọn kích thước!');
      return;
    }
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      alert('Vui lòng chọn màu sắc!');
      return;
    }

    // ✅ Đảm bảo luôn có image hợp lệ
    const imageUrl = product?.images?.[0] || 
                     (product as any)?.featuredImage || 
                     (product as any)?.image || 
                     'https://via.placeholder.com/300x300?text=No+Image';

    const cartItem = {
      id: product?.id,
      name: product?.name,
      brand: 'Fashion Store',
      price: product?.salePrice || product?.price || 0,
      displayOriginalPrice: product?.salePrice ? `${product.price.toLocaleString('vi-VN')}đ` : '',
      image: imageUrl,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    };
    
    // Get existing cart or create new
    const existingCart = localStorage.getItem('cart');
    const cart = existingCart ? JSON.parse(existingCart) : [];
    
    // Check if item already exists
    const existingIndex = cart.findIndex((item: any) => 
      item.id === cartItem.id && 
      item.size === cartItem.size && 
      item.color === cartItem.color
    );
    
    if (existingIndex >= 0) {
      // Update quantity
      cart[existingIndex].quantity += quantity;
    } else {
      // Add new item
      cart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Đã thêm vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    // ✅ Validation: Chỉ validate nếu sản phẩm CÓ variants
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Vui lòng chọn kích thước!');
      return;
    }
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      alert('Vui lòng chọn màu sắc!');
      return;
    }

    // ✅ Đảm bảo luôn có image hợp lệ
    const imageUrl = product?.images?.[0] || 
                     (product as any)?.featuredImage || 
                     (product as any)?.image || 
                     'https://via.placeholder.com/300x300?text=No+Image';

    // Add to cart and redirect to checkout
    const cartItem = {
      id: product?.id,
      name: product?.name,
      price: product?.salePrice || product?.price || 0,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
      image: imageUrl
    };
    
    // Get existing cart or create new
    const existingCart = localStorage.getItem('cart');
    const cart = existingCart ? JSON.parse(existingCart) : [];
    
    // Add item to cart
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Redirect to checkout
    router.push('/checkout');
  };

  if (loading) {
    return (
      <Layout>
        <LoadingContainer>Đang tải...</LoadingContainer>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <ErrorContainer>
          <ErrorText>Không tìm thấy sản phẩm</ErrorText>
          <BackButton onClick={() => router.push('/products')}>
            Quay lại danh sách sản phẩm
          </BackButton>
        </ErrorContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <ProductGrid>
          {/* Images Section */}
          <ImagesSection>
            <MainImage
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <img 
                src={
                  product.images && product.images.length > 0 
                    ? (typeof product.images[selectedImage] === 'string' 
                        ? product.images[selectedImage] 
                        : (product.images[selectedImage] as any)?.url)
                    : (product as any).featuredImage || 'https://via.placeholder.com/600x600?text=No+Image'
                } 
                alt={product.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600?text=No+Image';
                }}
              />
            </MainImage>
            
            <Thumbnails>
              {(() => {
                const imageUrls = product.images && product.images.length > 0
                  ? product.images.map((img: any) => typeof img === 'string' ? img : img.url)
                  : [
                      (product as any).featuredImage || 'https://via.placeholder.com/150x150?text=1',
                      'https://via.placeholder.com/150x150?text=2',
                      'https://via.placeholder.com/150x150?text=3',
                      'https://via.placeholder.com/150x150?text=4'
                    ];
                
                return imageUrls.slice(0, 4).map((imageUrl: string, index: number) => (
                  <Thumbnail
                    key={index}
                    active={selectedImage === index}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={imageUrl} 
                      alt={`${product.name} ${index + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/150x150?text=${index + 1}`;
                      }}
                    />
                  </Thumbnail>
                ));
              })()}
            </Thumbnails>
          </ImagesSection>

          {/* Product Info Section */}
          <InfoSection>
            <ProductName>{product.name}</ProductName>
            
            <RatingSection>
              <Stars>
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    fill={i < (product.rating || 0) ? '#fbbf24' : 'none'}
                    color="#fbbf24"
                  />
                ))}
              </Stars>
              <ReviewCount>({product.reviews || 0} đánh giá)</ReviewCount>
            </RatingSection>

            <PriceSection>
              {product.salePrice ? (
                <>
                  <SalePrice>{product.salePrice.toLocaleString('vi-VN')} ₫</SalePrice>
                  <OriginalPrice>{product.price.toLocaleString('vi-VN')} ₫</OriginalPrice>
                  <Discount>
                    -{Math.round((1 - product.salePrice / product.price) * 100)}%
                  </Discount>
                </>
              ) : (
                <Price>{product.price.toLocaleString('vi-VN')} ₫</Price>
              )}
            </PriceSection>

            <ShortDescription>{product.description}</ShortDescription>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <OptionSection>
                <OptionLabel>
                  Kích thước: <RequiredStar>*</RequiredStar>
                  {!selectedSize && <RequiredNote>(Vui lòng chọn kích thước)</RequiredNote>}
                </OptionLabel>
                <OptionButtons>
                  {product.sizes.map((size) => (
                    <OptionButton
                      key={size}
                      active={selectedSize === size}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </OptionButton>
                  ))}
                </OptionButtons>
              </OptionSection>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <OptionSection>
                <OptionLabel>
                  Màu sắc: <RequiredStar>*</RequiredStar>
                  {!selectedColor && <RequiredNote>(Vui lòng chọn màu sắc)</RequiredNote>}
                </OptionLabel>
                <OptionButtons>
                  {product.colors.map((color) => (
                    <OptionButton
                      key={color}
                      active={selectedColor === color}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </OptionButton>
                  ))}
                </OptionButtons>
              </OptionSection>
            )}

            {/* Quantity */}
            <OptionSection>
              <OptionLabel>Số lượng:</OptionLabel>
              <QuantitySelector>
                <QuantityButton
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <FiMinus />
                </QuantityButton>
                <QuantityValue>{quantity}</QuantityValue>
                <QuantityButton
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <FiPlus />
                </QuantityButton>
              </QuantitySelector>
              <StockInfo>
                {product.stock > 0 ? (
                  <InStock>Còn {product.stock} sản phẩm</InStock>
                ) : (
                  <OutOfStock>Hết hàng</OutOfStock>
                )}
              </StockInfo>
            </OptionSection>

            {/* Action Buttons */}
            <ActionButtons>
              <AddToCartButton
                onClick={handleAddToCart}
                disabled={
                  product.stock === 0 || 
                  (product.sizes && product.sizes.length > 0 && !selectedSize) ||
                  (product.colors && product.colors.length > 0 && !selectedColor)
                }
                whileHover={{ scale: product.stock > 0 ? 1.02 : 1 }}
                whileTap={{ scale: product.stock > 0 ? 0.98 : 1 }}
                title={
                  (product.sizes && product.sizes.length > 0 && !selectedSize) || 
                  (product.colors && product.colors.length > 0 && !selectedColor)
                    ? 'Vui lòng chọn kích thước và màu sắc' 
                    : ''
                }
              >
                <FiShoppingCart />
                Thêm vào giỏ hàng
              </AddToCartButton>
              <BuyNowButton
                onClick={handleBuyNow}
                disabled={
                  product.stock === 0 || 
                  (product.sizes && product.sizes.length > 0 && !selectedSize) ||
                  (product.colors && product.colors.length > 0 && !selectedColor)
                }
                whileHover={{ scale: product.stock > 0 ? 1.02 : 1 }}
                whileTap={{ scale: product.stock > 0 ? 0.98 : 1 }}
                title={
                  (product.sizes && product.sizes.length > 0 && !selectedSize) || 
                  (product.colors && product.colors.length > 0 && !selectedColor)
                    ? 'Vui lòng chọn kích thước và màu sắc' 
                    : ''
                }
              >
                Mua ngay
              </BuyNowButton>
            </ActionButtons>
            
            {/* Validation Message - Chỉ hiển thị nếu sản phẩm CÓ variants */}
            {((product.sizes && product.sizes.length > 0 && !selectedSize) || 
              (product.colors && product.colors.length > 0 && !selectedColor)) && (
              <ValidationMessage>
                ⚠️ Vui lòng chọn đầy đủ kích thước và màu sắc để tiếp tục
              </ValidationMessage>
            )}

            {/* Secondary Actions */}
            <SecondaryActions>
              <SecondaryButton>
                <FiHeart />
                Yêu thích
              </SecondaryButton>
              <SecondaryButton>
                <FiShare2 />
                Chia sẻ
              </SecondaryButton>
            </SecondaryActions>
          </InfoSection>
        </ProductGrid>

        {/* Tabs Section */}
        <TabsSection>
          <TabsHeader>
            <Tab active={activeTab === 'description'} onClick={() => setActiveTab('description')}>
              Mô tả sản phẩm
            </Tab>
            <Tab active={activeTab === 'specs'} onClick={() => setActiveTab('specs')}>
              Thông số kỹ thuật
            </Tab>
            <Tab active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>
              Đánh giá ({product.reviews || 0})
            </Tab>
          </TabsHeader>

          <TabContent>
            {activeTab === 'description' && (
              <DescriptionContent>
                <h3>Mô tả chi tiết</h3>
                <p>{product.description}</p>
                <p>Sản phẩm chất lượng cao, được làm từ vật liệu cao cấp, đảm bảo độ bền và thoải mái khi sử dụng.</p>
              </DescriptionContent>
            )}

            {activeTab === 'specs' && (
              <SpecsContent>
                <h3>Thông số kỹ thuật</h3>
                <SpecsTable>
                  <tbody>
                    <tr>
                      <td>Mã sản phẩm (SKU)</td>
                      <td>{(product as any).sku || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td>Danh mục</td>
                      <td>{(product as any).categoryId || product.category || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td>Thương hiệu</td>
                      <td>{(product as any).vendor || 'Fashion Store'}</td>
                    </tr>
                    <tr>
                      <td>Tình trạng</td>
                      <td>
                        <StatusBadge inStock={product.stock > 0}>
                          {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : 'Hết hàng'}
                        </StatusBadge>
                      </td>
                    </tr>
                    <tr>
                      <td>Chất liệu</td>
                      <td>Cotton cao cấp, thoáng mát</td>
                    </tr>
                    <tr>
                      <td>Xuất xứ</td>
                      <td>Việt Nam</td>
                    </tr>
                    {(product as any).weight && (
                      <tr>
                        <td>Trọng lượng</td>
                        <td>{(product as any).weight}g</td>
                      </tr>
                    )}
                    {(product as any).dimensions && (
                      <tr>
                        <td>Kích thước đóng gói</td>
                        <td>
                          {(product as any).dimensions.length} x {(product as any).dimensions.width} x {(product as any).dimensions.height} cm
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td>Hướng dẫn bảo quản</td>
                      <td>
                        - Giặt máy ở nhiệt độ thường<br/>
                        - Không sử dụng chất tẩy<br/>
                        - Phơi nơi thoáng mát, tránh ánh nắng trực tiếp<br/>
                        - Là ở nhiệt độ trung bình
                      </td>
                    </tr>
                    <tr>
                      <td>Bảo hành</td>
                      <td>Đổi trả trong vòng 30 ngày nếu có lỗi từ nhà sản xuất</td>
                    </tr>
                    {(product as any).tags && (product as any).tags.length > 0 && (
                      <tr>
                        <td>Tags</td>
                        <td>{(product as any).tags.join(', ')}</td>
                      </tr>
                    )}
                  </tbody>
                </SpecsTable>
              </SpecsContent>
            )}

            {activeTab === 'reviews' && (
              <ReviewsContent>
                <ProductReviews productId={product.id} />
              </ReviewsContent>
            )}
          </TabContent>
        </TabsSection>

        {/* Related Products */}
        <RelatedSection>
          <SectionTitle>Có thể bạn thích</SectionTitle>
          <RelatedGrid>
            {relatedProducts.map((item) => (
              <RelatedCard
                key={item.id}
                onClick={() => router.push(`/products/${item.id}`)}
                whileHover={{ y: -5 }}
              >
                <RelatedImage>
                  <img 
                    src={item.images?.[0] || 'https://via.placeholder.com/300x300'} 
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                </RelatedImage>
                <RelatedInfo>
                  <RelatedName>{item.name}</RelatedName>
                  <RelatedPrice>
                    {item.salePrice ? (
                      <>
                        <span style={{ color: '#ef4444', fontWeight: 700 }}>
                          {item.salePrice.toLocaleString('vi-VN')} ₫
                        </span>
                        <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.875rem' }}>
                          {item.price.toLocaleString('vi-VN')} ₫
                        </span>
                      </>
                    ) : (
                      <span style={{ fontWeight: 700 }}>
                        {item.price.toLocaleString('vi-VN')} ₫
                      </span>
                    )}
                  </RelatedPrice>
                </RelatedInfo>
              </RelatedCard>
            ))}
          </RelatedGrid>
        </RelatedSection>
      </Container>
    </Layout>
  );
}

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ImagesSection = styled.div``;

const MainImage = styled(motion.div)`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 1rem;
  }
`;

const Thumbnails = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
`;

const Thumbnail = styled.div<{ active: boolean }>`
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.active ? '#000' : '#e5e7eb'};
  transition: all 0.2s;
  background: #f9fafb;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 0.5rem;
  }

  &:hover {
    border-color: #000;
  }
`;

const InfoSection = styled.div``;

const ProductName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Stars = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const ReviewCount = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Price = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
`;

const SalePrice = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #ef4444;
`;

const OriginalPrice = styled.div`
  font-size: 1.25rem;
  color: #9ca3af;
  text-decoration: line-through;
`;

const Discount = styled.div`
  padding: 0.25rem 0.75rem;
  background: #ef4444;
  color: white;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
`;

const ShortDescription = styled.p`
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const OptionSection = styled.div`
  margin-bottom: 1.5rem;
`;

const OptionLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RequiredStar = styled.span`
  color: #ef4444;
  font-size: 1rem;
`;

const RequiredNote = styled.span`
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 400;
  font-style: italic;
`;

const ValidationMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 6px;
  color: #92400e;
  font-size: 0.875rem;
  font-weight: 500;
`;

const OptionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const OptionButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: 2px solid ${props => props.active ? '#000' : '#e5e7eb'};
  background: ${props => props.active ? '#000' : 'white'};
  color: ${props => props.active ? 'white' : '#1f2937'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    border-color: #000;
  }
`;

const QuantitySelector = styled.div`
  display: inline-flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const QuantityButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: white;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #f3f4f6;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityValue = styled.div`
  width: 60px;
  text-align: center;
  font-weight: 600;
`;

const StockInfo = styled.div`
  display: inline-block;
  margin-left: 1rem;
  font-size: 0.875rem;
`;

const InStock = styled.span`
  color: #10b981;
`;

const OutOfStock = styled.span`
  color: #ef4444;
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const AddToCartButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  color: #000;
  border: 2px solid #000;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #000;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BuyNowButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #000;
  color: white;
  border: 2px solid #000;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #1f2937;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  color: #1f2937;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #e5e7eb;
  }
`;

const TabsSection = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 3rem;
  border: 1px solid #e5e7eb;
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 1rem;
  background: ${props => props.active ? 'white' : '#f9fafb'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#000' : 'transparent'};
  font-weight: ${props => props.active ? 600 : 400};
  color: ${props => props.active ? '#000' : '#6b7280'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: white;
  }
`;

const TabContent = styled.div`
  padding: 2rem;
`;

const DescriptionContent = styled.div`
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  p {
    color: #6b7280;
    line-height: 1.8;
    margin-bottom: 1rem;
  }
`;

const SpecsContent = styled.div`
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
`;

const SpecsTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  tr {
    border-bottom: 1px solid #e5e7eb;
  }

  td {
    padding: 1rem;
    line-height: 1.8;
    
    &:first-child {
      font-weight: 600;
      color: #1f2937;
      width: 250px;
      vertical-align: top;
    }

    &:last-child {
      color: #6b7280;
    }
  }
`;

const StatusBadge = styled.span<{ inStock: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => props.inStock ? '#10b98120' : '#ef444420'};
  color: ${props => props.inStock ? '#10b981' : '#ef4444'};
`;

const ReviewsContent = styled.div`
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReviewItem = styled.div`
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const ReviewAuthor = styled.div`
  font-weight: 600;
  color: #1f2937;
`;

const ReviewStars = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const ReviewText = styled.p`
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 0.5rem;
`;

const ReviewDate = styled.div`
  font-size: 0.875rem;
  color: #9ca3af;
`;

const EmptyReviews = styled.div`
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
`;

const RelatedSection = styled.div``;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const RelatedCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const RelatedImage = styled.div`
  aspect-ratio: 1;
  overflow: hidden;
  background: #f9fafb;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 1rem;
  }
`;

const RelatedInfo = styled.div`
  padding: 1rem;
`;

const RelatedName = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RelatedPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
`;

const ErrorText = styled.p`
  font-size: 1.25rem;
  color: #6b7280;
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #000;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1f2937;
  }
`;
