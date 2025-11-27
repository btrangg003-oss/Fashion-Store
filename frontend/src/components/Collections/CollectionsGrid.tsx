import Image from 'next/image'
import Link from 'next/link'
import styled from 'styled-components'
import { motion } from 'framer-motion'

const Section = styled.section`
  padding: 100px 0;
  background: white;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const CollectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`

const CollectionCard = styled(motion.div)`
  position: relative;
  height: 500px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
    z-index: 2;
    transition: all 0.3s ease;
  }
  
  &:hover::after {
    background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
  }
  
  &:hover img {
    transform: scale(1.1);
  }
`

const CollectionImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  
  img {
    transition: transform 0.5s ease;
  }
`

const CollectionContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px;
  z-index: 3;
  color: white;
`

const CollectionTitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`

const CollectionDescription = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 20px;
  line-height: 1.6;
`

const CollectionMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`

const ProductCount = styled.span`
  font-size: 0.9rem;
  opacity: 0.8;
`

const PriceRange = styled.span`
  font-size: 1rem;
  font-weight: 600;
`

const CollectionButton = styled.span`
  display: inline-block;
  padding: 12px 24px;
  border: 2px solid white;
  border-radius: 30px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: white;
    color: #000;
    transform: translateY(-2px);
  }
`

const collections = [
  {
    id: 1,
    title: 'Xuân Hè 2024',
    description: 'Bộ sưu tập tươi mới với những gam màu pastel nhẹ nhàng và chất liệu thoáng mát, phù hợp cho mùa xuân hè.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    productCount: '45 sản phẩm',
    priceRange: '299K - 2.5M',
    link: '/collections/spring-summer-2024'
  },
  {
    id: 2,
    title: 'Thời trang công sở',
    description: 'Phong cách chuyên nghiệp và thanh lịch với những thiết kế hiện đại, phù hợp cho môi trường làm việc.',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    productCount: '38 sản phẩm',
    priceRange: '599K - 3.2M',
    link: '/collections/office-wear'
  },
  {
    id: 3,
    title: 'Dạ tiệc sang trọng',
    description: 'Những thiết kế lộng lẫy và quyến rũ cho các buổi tiệc trang trọng và sự kiện đặc biệt.',
    image: 'https://images.unsplash.com/photo-1566479179817-c0b2b2b5b5b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    productCount: '28 sản phẩm',
    priceRange: '1.2M - 5M',
    link: '/collections/evening-wear'
  },
  {
    id: 4,
    title: 'Phong cách đường phố',
    description: 'Thời trang trẻ trung và năng động với phong cách streetwear hiện đại, thể hiện cá tính riêng.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    productCount: '52 sản phẩm',
    priceRange: '199K - 1.8M',
    link: '/collections/streetwear'
  },
  {
    id: 5,
    title: 'Thu Đông 2024',
    description: 'Bộ sưu tập ấm áp với những tông màu đất và chất liệu dày dặn, hoàn hảo cho mùa thu đông.',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    productCount: '41 sản phẩm',
    priceRange: '399K - 3.5M',
    link: '/collections/autumn-winter-2024'
  },
  {
    id: 6,
    title: 'Phụ kiện cao cấp',
    description: 'Bộ sưu tập phụ kiện đa dạng từ túi xách, giày dép đến trang sức, hoàn thiện phong cách của bạn.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    productCount: '67 sản phẩm',
    priceRange: '99K - 2.8M',
    link: '/collections/accessories'
  }
]

const CollectionsGridComponent = () => {
  return (
    <Section>
      <Container>
        <CollectionsGrid>
          {collections.map((collection, index) => (
            <CollectionCard
              key={collection.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <Link href={collection.link}>
                <CollectionImage>
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </CollectionImage>
                
                <CollectionContent>
                  <CollectionTitle>{collection.title}</CollectionTitle>
                  <CollectionDescription>{collection.description}</CollectionDescription>
                  <CollectionMeta>
                    <ProductCount>{collection.productCount}</ProductCount>
                    <PriceRange>{collection.priceRange}</PriceRange>
                  </CollectionMeta>
                  <CollectionButton>Khám phá bộ sưu tập</CollectionButton>
                </CollectionContent>
              </Link>
            </CollectionCard>
          ))}
        </CollectionsGrid>
      </Container>
    </Section>
  )
}

export default CollectionsGridComponent