import React from 'react';
import styled from 'styled-components';

const collections = [
  { id: 1, title: 'Bộ Sưu Tập Xuân Hè', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80' },
  { id: 2, title: 'Thời Trang Công Sở', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80' },
  { id: 3, title: 'Phong Cách Dạo Phố', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80' },
  { id: 4, title: 'Váy Dự Tiệc', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80' }
];

const CollectionShowcase = () => {
  return (
    <Container>
      <Grid>
        {collections.map((collection) => (
          <CollectionCard key={collection.id}>
            <CollectionImage src={collection.image} alt={collection.title} />
            <CollectionOverlay>
              <CollectionTitle>{collection.title}</CollectionTitle>
              <ShopButton>Khám Phá Ngay</ShopButton>
            </CollectionOverlay>
          </CollectionCard>
        ))}
      </Grid>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const CollectionCard = styled.div`
  position: relative;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  
  &:hover img {
    transform: scale(1.1);
  }
  
  &:hover div {
    opacity: 1;
  }
`;

const CollectionImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
`;

const CollectionOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: 30px;
  opacity: 0.9;
  transition: opacity 0.3s ease;
`;

const CollectionTitle = styled.h3`
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 15px;
  text-align: center;
`;

const ShopButton = styled.button`
  padding: 10px 30px;
  background: white;
  color: #333;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #ff6b35;
    color: white;
    transform: translateY(-2px);
  }
`;

export default CollectionShowcase;
