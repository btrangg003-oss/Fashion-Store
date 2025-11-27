import styled from 'styled-components'
import { motion } from 'framer-motion'
import Link from 'next/link'

const Section = styled.section`
  max-width: 1400px;
  margin: 3rem auto;
  padding: 0 2rem;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const CollectionCard = styled(motion.div)`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  height: 300px;
  cursor: pointer;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%);
    z-index: 1;
    transition: all 0.3s ease;
  }
  
  &:hover::before {
    background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 100%);
  }
  
  &:hover img {
    transform: scale(1.1);
  }
`

const CollectionImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
`

const CollectionContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 1.5rem;
  z-index: 2;
  color: white;
`

const CollectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`

const CollectionDesc = styled.p`
  font-size: 0.9rem;
  opacity: 0.9;
`

const MiniCollections = () => {
  const collections = [
    {
      title: 'Bộ Sưu Tập Mùa Đông',
      description: 'Ấm áp và phong cách',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500',
      link: '/collections/winter'
    },
    {
      title: 'Thời Trang Công Sở',
      description: 'Chuyên nghiệp và thanh lịch',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500',
      link: '/collections/office'
    },
    {
      title: 'Phong Cách Dạo Phố',
      description: 'Thoải mái và năng động',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500',
      link: '/collections/street'
    },
    {
      title: 'Bộ Sưu Tập Giáng Sinh',
      description: 'Đặc biệt cho mùa lễ hội',
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500',
      link: '/collections/christmas'
    }
  ]

  return (
    <Section>
      <Grid>
        {collections.map((collection, index) => (
          <Link href={collection.link} key={index}>
            <CollectionCard
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <CollectionImage src={collection.image} alt={collection.title} />
              <CollectionContent>
                <CollectionTitle>{collection.title}</CollectionTitle>
                <CollectionDesc>{collection.description}</CollectionDesc>
              </CollectionContent>
            </CollectionCard>
          </Link>
        ))}
      </Grid>
    </Section>
  )
}

export default MiniCollections
