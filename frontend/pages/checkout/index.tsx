import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Layout from '@/components/layout/Layout';
import CheckoutSteps from '@/components/Checkout/CheckoutSteps';
import ShippingForm, { ShippingData } from '@/components/Checkout/ShippingForm';
import ShippingMethod, { ShippingMethodData } from '@/components/Checkout/ShippingMethod';
import PaymentStep from '@/components/Checkout/PaymentStep';
import { useAuth } from '@/contexts/AuthContext';

const CheckoutPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodData | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    // Load cart from localStorage
    const cart = localStorage.getItem('cart');
    if (cart) {
      const items = JSON.parse(cart);
      setCartItems(items);
      
      const total = items.reduce((sum: number, item: any) => {
        return sum + (item.price * item.quantity);
      }, 0);
      setSubtotal(total);
    } else {
      // No items in cart, redirect to cart page
      router.push('/cart');
    }

    // Auto-fill user info if logged in
    if (user) {
      const userAny = user as any; // Type assertion để truy cập các field mở rộng
      setShippingData({
        fullName: userAny.fullName || `${user.firstName} ${user.lastName}` || '',
        phone: user.phone || '',
        email: user.email || '',
        address: userAny.address || '',
        city: userAny.city || '',
        district: userAny.district || '',
        ward: userAny.ward || '',
        note: ''
      });
    }
  }, [user]);

  const handleShippingSubmit = (data: ShippingData) => {
    setShippingData(data);
    setCurrentStep(2);
  };

  const handleShippingMethodSubmit = (method: ShippingMethodData) => {
    setShippingMethod(method);
    setCurrentStep(3);
  };

  const handleComplete = (orderId: string) => {
    // Clear cart
    localStorage.removeItem('cart');
    // Redirect to success page
    router.push(`/checkout/success?orderId=${orderId}`);
  };

  return (
    <Layout>
      <Container>
        <Header>
          <Title>Thanh toán</Title>
        </Header>

        <CheckoutSteps currentStep={currentStep} />

        <Content>
          {currentStep === 1 && (
            <ShippingForm
              onNext={handleShippingSubmit}
              initialData={shippingData || undefined}
            />
          )}

          {currentStep === 2 && shippingData && (
            <ShippingMethod
              onNext={handleShippingMethodSubmit}
              onBack={() => setCurrentStep(1)}
              initialMethod={shippingMethod || undefined}
            />
          )}

          {currentStep === 3 && shippingData && shippingMethod && (
            <PaymentStep
              shippingInfo={shippingData}
              shippingMethod={shippingMethod}
              cartItems={cartItems}
              subtotal={subtotal}
              onBack={() => setCurrentStep(2)}
              onComplete={handleComplete}
            />
          )}
        </Content>
      </Container>
    </Layout>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 80vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
`;

const Content = styled.div`
  margin-top: 2rem;
`;

export default CheckoutPage;
