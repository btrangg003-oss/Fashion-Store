import { useRouter } from 'next/router'
import Image from 'next/image'
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

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #000;
`

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`

const CollectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const CollectionCard = styled(motion.div)`
  position: relative;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
    z-index: 2;
    transition: all 0.3s ease;
  }
  
  &:hover::after {
    background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.5) 100%);
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
  padding: 30px;
  z-index: 3;
  color: white;
`

const CollectionTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 10px;
`

const CollectionDescription = styled.p`
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 20px;
  line-height: 1.5;
`

const CollectionButton = styled.span`
  display: inline-block;
  padding: 10px 20px;
  border: 2px solid white;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: white;
    color: #000;
  }
`

const collections = [
  {
    id: 'spring-summer-2024',
    title: 'Bộ sưu tập Xuân Hè 2024',
    description: 'Khám phá những thiết kế tươi mới và năng động cho mùa xuân hè',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['xuân hè', 'summer', 'spring']
  },
  {
    id: 'office-wear',
    title: 'Thời trang công sở',
    description: 'Phong cách chuyên nghiệp và thanh lịch cho môi trường làm việc',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['công sở', 'office', 'formal']
  },
  {
    id: 'evening-wear',
    title: 'Dạ tiệc sang trọng',
    description: 'Những thiết kế lộng lẫy cho những dịp đặc biệt',
    image: 'https://images.unsplash.com/photo-1566479179817-c0b2b2b5b5b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['dạ tiệc', 'evening', 'party']
  },
  {
    id: 'streetwear',
    title: 'Phong cách đường phố',
    description: 'Thời trang trẻ trung và cá tính cho cuộc sống hàng ngày',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['streetwear', 'casual', 'đường phố']
  }
]

const Collections = () => {
  const router = useRouter();

  const handleCollectionClick = (collection: typeof collections[0]) => {
    // Navigate to products page with collection filter
    router.push(`/products?collection=${collection.id}`);
  };

  return (
    <Section>
      <Container>
        <SectionHeader>
          <SectionTitle>Bộ sưu tập đặc biệt</SectionTitle>
          <SectionSubtitle>
            Khám phá các bộ sưu tập được tuyển chọn kỹ lưỡng với phong cách độc đáo và xu hướng mới nhất
          </SectionSubtitle>
        </SectionHeader>

        <CollectionGrid>
          {collections.map((collection, index) => (
            <CollectionCard
              key={collection.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => handleCollectionClick(collection)}
            >
              <CollectionImage>
                <Image
                  src={collection.image}
                  alt={collection.title}
                  width={800}
                  height={600}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </CollectionImage>

              <CollectionContent>
                <CollectionTitle>{collection.title}</CollectionTitle>
                <CollectionDescription>{collection.description}</CollectionDescription>
                <CollectionButton>Khám phá ngay</CollectionButton>
              </CollectionContent>
            </CollectionCard>
          ))}
        </CollectionGrid>
      </Container>
    </Section>
  )
}

export default Collections