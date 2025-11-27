import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const categories = [
  { id: 1, name: 'Váy đầm', count: 156, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80', slug: 'vay-dam' },
  { id: 2, name: 'Áo sơ mi', count: 89, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80', slug: 'ao-so-mi' },
  { id: 3, name: 'Áo thun', count: 234, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', slug: 'ao-thun' },
  { id: 4, name: 'Chân váy', count: 67, image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80', slug: 'chan-vay' },
  { id: 5, name: 'Áo khoác', count: 123, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80', slug: 'ao-khoac' },
  { id: 6, name: 'Quần dài', count: 178, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80', slug: 'quan-dai' },
  { id: 7, name: 'Phụ kiện', count: 345, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&q=80', slug: 'phu-kien' }
];

const CategoryGrid = () => {
  return (
    <Container>
      <SectionTitle>Danh Mục Nổi Bật</SectionTitle>
      <Grid>
        {categories.map((category) => (
          <Link key={category.id} href={`/products?category=${category.slug}`} passHref>
            <CategoryCard>
              <CategoryImageWrapper>
                <CategoryImage src={category.image} alt={category.name} />
                <CategoryCount>{category.count}</CategoryCount>
              </CategoryImageWrapper>
              <CategoryInfo>
                <CategoryName>{category.name}</CategoryName>
              </CategoryInfo>
            </CategoryCard>
          </Link>
        ))}
      </Grid>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 20px;
  background: #f9f9f9;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 40px;
  color: #333;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 20px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CategoryCard = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  &:hover img {
    box-shadow: 0 6px 20px rgba(255, 107, 53, 0.3);
  }
`;

const CategoryImageWrapper = styled.div`
  position: relative;
  margin-bottom: 15px;
`;

const CategoryImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
`;

const CategoryCount = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  background: #ff6b35;
  color: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.4);
`;

const CategoryInfo = styled.div`
  text-align: center;
`;

const CategoryName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #333;
`;

export default CategoryGrid;
