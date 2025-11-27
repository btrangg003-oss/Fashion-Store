import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

// Test page để verify checkout mới hoạt động
export default function TestCheckoutNew() {
    const router = useRouter();

    const addTestProduct = () => {
        const testCart = [
            {
                id: 'test-product-1',
                name: 'Váy da hổi sang trọng',
                brand: 'Fashion Store',
                price: 2499000,
                displayOriginalPrice: '2999000đ',
                image: 'https://via.placeholder.com/300x300?text=Product',
                size: 'M',
                color: 'Đỏ burgundy',
                quantity: 1
            }
        ];

        localStorage.setItem('cart', JSON.stringify(testCart));
        alert('Đã thêm sản phẩm test vào giỏ hàng!');
    };

    const goToCheckout = () => {
        router.push('/checkout');
    };

    const goToCart = () => {
        router.push('/cart');
    };

    const clearCart = () => {
        localStorage.removeItem('cart');
        alert('Đã xóa giỏ hàng!');
    };

    const viewCart = () => {
        const cart = localStorage.getItem('cart');
        if (cart) {
            console.log('Cart data:', JSON.parse(cart));
            alert('Xem console để thấy dữ liệu giỏ hàng');
        } else {
            alert('Giỏ hàng trống');
        }
    };

    return (
        <Container>
            <Title>Test Checkout Mới (3 Bước)</Title>

            <Section>
                <SectionTitle>1. Thêm sản phẩm test</SectionTitle>
                <Button onClick={addTestProduct}>Thêm sản phẩm test vào giỏ</Button>
            </Section>

            <Section>
                <SectionTitle>2. Xem giỏ hàng</SectionTitle>
                <ButtonGroup>
                    <Button onClick={viewCart}>Xem dữ liệu giỏ (Console)</Button>
                    <Button onClick={goToCart}>Đi đến trang giỏ hàng</Button>
                </ButtonGroup>
            </Section>

            <Section>
                <SectionTitle>3. Checkout</SectionTitle>
                <Button $primary onClick={goToCheckout}>
                    Đi đến Checkout 3 Bước
                </Button>
            </Section>

            <Section>
                <SectionTitle>4. Xóa giỏ hàng</SectionTitle>
                <Button $danger onClick={clearCart}>Xóa giỏ hàng</Button>
            </Section>

            <Info>
                <h3>Hướng dẫn:</h3>
                <ol>
                    <li>Click &quot;Thêm sản phẩm test vào giỏ&quot;</li>
                    <li>Click &quot;Đi đến Checkout 3 Bước&quot;</li>
                    <li>Bạn sẽ thấy:
                        <ul>
                            <li>Thanh điều hướng 3 bước ở trên</li>
                            <li>Bước 1: Form thông tin giao hàng</li>
                            <li>Sau khi điền xong → Bước 2: Chọn vận chuyển</li>
                            <li>Sau khi chọn → Bước 3: Xem tóm tắt và thanh toán</li>
                        </ul>
                    </li>
                </ol>
            </Info>
        </Container>
    );
}

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  color: #1f2937;
`;

const Section = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props =>
        props.$primary ? '#3b82f6' :
            props.$danger ? '#ef4444' :
                '#6b7280'};
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props =>
        props.$primary ? '#2563eb' :
            props.$danger ? '#dc2626' :
                '#4b5563'};
    transform: translateY(-2px);
  }
`;

const Info = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-top: 2rem;

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #1e40af;
  }

  ol {
    padding-left: 1.5rem;
    color: #1e3a8a;
    line-height: 1.8;
  }

  ul {
    padding-left: 1.5rem;
    margin-top: 0.5rem;
  }

  li {
    margin-bottom: 0.5rem;
  }
`;
