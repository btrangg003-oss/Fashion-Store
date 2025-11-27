import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

const news = [
  {
    id: 1,
    title: 'Áo khoác dáng dài - Xu hướng thời trang phong cách',
    excerpt: 'Khám phá xu hướng áo khoác dáng dài đang làm mưa làm gió trong giới thời trang. Những thiết kế thanh lịch và hiện đại......',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
    date: '18 Nov 2025',
    author: 'fashionstore'
  },
  {
    id: 2,
    title: 'Cách kết hợp áo denim để diện xuất sắc nhất',
    excerpt: 'Áo denim là item không thể thiếu trong tủ đồ. Cùng tìm hiểu cách phối đồ với áo denim để tạo nên phong cách riêng......',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80',
    date: '17 Nov 2025',
    author: 'fashionstore'
  },
  {
    id: 3,
    title: 'Tuyệt chiêu mix đồ với quần jeans trong mùa đông',
    excerpt: 'Quần jeans luôn là lựa chọn hoàn hảo cho mọi mùa. Hãy cùng khám phá những cách phối đồ thông minh và ấm áp......',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
    date: '16 Nov 2025',
    author: 'fashionstore'
  },
  {
    id: 4,
    title: 'Phụ kiện thời trang giúp bạn nổi bật mọi lúc',
    excerpt: 'Những phụ kiện nhỏ xinh có thể tạo nên sự khác biệt lớn trong phong cách của bạn. Cùng tìm hiểu ngay......',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80',
    date: '15 Nov 2025',
    author: 'fashionstore'
  }
];

const LatestNews = () => {
  return (
    <Container>
      <Header>
        <SectionTitle>Tin Tức Mới Nhất</SectionTitle>
        <Description>Cập nhật những tin tức thời trang mới nhất</Description>
      </Header>
      
      <NewsGrid>
        {news.map((article) => (
          <NewsCard key={article.id}>
            <NewsImage src={article.image} alt={article.title} />
            <NewsContent>
              <NewsTitle>{article.title}</NewsTitle>
              <NewsExcerpt>{article.excerpt}</NewsExcerpt>
              <NewsMeta>
                <MetaItem>
                  Đăng bởi {article.author}
                </MetaItem>
              </NewsMeta>
              <ReadMoreLink href={`/news/${article.id}`}>Đọc tiếp</ReadMoreLink>
            </NewsContent>
          </NewsCard>
        ))}
      </NewsGrid>
      
      <ViewAllButton>
        <Link href="/blog">Xem Tất Cả</Link>
      </ViewAllButton>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #666;
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const NewsCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
`;

const NewsImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const NewsContent = styled.div`
  padding: 20px;
`;

const NewsTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsExcerpt = styled.p`
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #999;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const ReadMoreLink = styled.a`
  color: #ff6b35;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  display: inline-block;
  
  &:hover {
    color: #ff5722;
  }
`;

const ViewAllButton = styled.div`
  text-align: center;
  margin-top: 40px;
  
  a {
    display: inline-block;
    padding: 12px 40px;
    background: #ff6b35;
    color: white;
    border-radius: 25px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    
    &:hover {
      background: #ff5722;
      transform: translateY(-2px);
    }
  }
`;

export default LatestNews;
