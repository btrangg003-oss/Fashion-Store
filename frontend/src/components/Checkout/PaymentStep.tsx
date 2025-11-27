import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiGift } from 'react-icons/fi';
import OrderSummary from './OrderSummary';
import PaymentMethodModal from './PaymentMethodModal';
import QRPaymentModal from './QRPaymentModal';
import VoucherInput from './VoucherInput';
import { ShippingData } from './ShippingForm';
import { ShippingMethodData } from './ShippingMethod';
import { PaymentMethod } from './PaymentMethodModal';
import useOrderSync from '@/hooks/useOrderSync';

interface PaymentStepProps {
  shippingInfo: ShippingData;
  shippingMethod: ShippingMethodData;
  cartItems: any[];
  subtotal: number;
  onBack: () => void;
  onComplete: (orderId: string) => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  shippingInfo,
  shippingMethod,
  cartItems,
  subtotal,
  onBack,
  onComplete
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [orderId, setOrderId] = useState('');
  const [appliedVouchers, setAppliedVouchers] = useState<Array<{
    code: string;
    discount: number;
  }>>([]);
  const { notifyNewOrder } = useOrderSync();

  const totalDiscount = appliedVouchers.reduce((sum, v) => sum + v.discount, 0);
  const total = subtotal + shippingMethod.price - totalDiscount;

  // Load vouchers from cart on mount
  useEffect(() => {
    const cartVouchers = localStorage.getItem('cart_vouchers');
    if (cartVouchers) {
      try {
        const vouchers = JSON.parse(cartVouchers);
        if (vouchers.length > 0) {
          // Validate each voucher
          validateCartVouchers(vouchers);
        }
      } catch (error) {
        console.error('Error loading cart vouchers:', error);
      }
    }
  }, []);

  const validateCartVouchers = async (vouchers: Array<{ code: string; discount: number }>) => {
    const validVouchers: Array<{ code: string; discount: number }> = [];
    
    for (const voucher of vouchers) {
      try {
        const response = await fetch('/api/vouchers/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            code: voucher.code,
            orderValue: subtotal + shippingMethod.price
          })
        });

        const data = await response.json();
        if (data.valid) {
          validVouchers.push({
            code: data.code,
            discount: data.discountAmount
          });
        }
      } catch (error) {
        console.error(`Error validating voucher ${voucher.code}:`, error);
      }
    }

    setAppliedVouchers(validVouchers);
  };

  const handlePlaceOrder = () => {
    setShowPaymentModal(true);
  };

  const handleSelectPayment = async (method: PaymentMethod) => {
    setSelectedPayment(method);
    setShowPaymentModal(false);

    // Generate order ID
    const newOrderId = `ORD${Date.now()}`;
    setOrderId(newOrderId);

    // If COD, complete immediately
    if (method.type === 'cod') {
      await createOrder(newOrderId, method);
      onComplete(newOrderId);
      return;
    }

    // If e-wallet, show QR
    if (method.type === 'ewallet') {
      await createOrder(newOrderId, method);
      setShowQRModal(true);
      return;
    }

    // If card, redirect to payment gateway
    if (method.type === 'card') {
      await createOrder(newOrderId, method);
      // Simulate redirect
      setTimeout(() => {
        onComplete(newOrderId);
      }, 2000);
    }
  };

  const handleApplyVoucher = (code: string, discountAmount: number) => {
    // Check duplicate
    if (appliedVouchers.some(v => v.code === code)) {
      alert('Mã giảm giá này đã được áp dụng rồi!');
      return;
    }

    // Add voucher
    const newVouchers = [...appliedVouchers, { code, discount: discountAmount }];
    setAppliedVouchers(newVouchers);
    
    // Update localStorage
    localStorage.setItem('cart_vouchers', JSON.stringify(newVouchers));
  };

  const handleRemoveVoucher = (code: string) => {
    const newVouchers = appliedVouchers.filter(v => v.code !== code);
    setAppliedVouchers(newVouchers);
    
    // Update localStorage
    localStorage.setItem('cart_vouchers', JSON.stringify(newVouchers));
  };

  const createOrder = async (orderId: string, paymentMethod: PaymentMethod) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          shippingInfo,
          shippingMethod,
          items: cartItems,
          subtotal,
          discount: totalDiscount,
          voucherCode: appliedVouchers.length > 0 ? appliedVouchers[0].code : undefined,
          voucherCodes: appliedVouchers.map(v => v.code),
          total,
          paymentMethod: paymentMethod.id,
          paymentStatus: paymentMethod.type === 'cod' ? 'pending' : 'processing'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      // Clear cart vouchers after successful order
      localStorage.removeItem('cart_vouchers');
      
      // Notify admin about new order
      notifyNewOrder(orderId);
      
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handlePaymentSuccess = () => {
    setShowQRModal(false);
    onComplete(orderId);
  };

  return (
    <Container>
      <Grid>
        <MainContent>
          <Title>Xác nhận đơn hàng</Title>
          
          <VoucherSection>
            <VoucherInput
              onApply={handleApplyVoucher}
              onRemove={handleRemoveVoucher}
              orderValue={subtotal + shippingMethod.price}
              appliedVouchers={appliedVouchers}
            />
            
            <VoucherLink href="/profile?tab=coupons">
              <FiGift /> Xem tất cả ưu đãi & mã giảm giá
            </VoucherLink>
          </VoucherSection>
          
          <OrderSummary
            shippingInfo={shippingInfo}
            shippingMethod={shippingMethod}
            cartItems={cartItems}
            subtotal={subtotal}
            discount={totalDiscount}
            voucherCodes={appliedVouchers.map(v => v.code)}
          />
        </MainContent>
      </Grid>

      <ButtonGroup>
        <BackButton onClick={onBack}>Quay lại</BackButton>
        <PlaceOrderButton onClick={handlePlaceOrder}>
          Đặt hàng • {formatPrice(total)}
        </PlaceOrderButton>
      </ButtonGroup>

      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectMethod={handleSelectPayment}
        amount={total}
      />

      {selectedPayment?.type === 'ewallet' && (
        <QRPaymentModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          paymentMethod={selectedPayment.provider || 'momo'}
          amount={total}
          orderId={orderId}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </Container>
  );
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export default PaymentStep;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Grid = styled.div`
  margin-bottom: 2rem;
`;

const MainContent = styled.div``;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1f2937;
`;

const VoucherSection = styled.div`
  margin-bottom: 2rem;
`;

const VoucherLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  margin-top: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #eff6ff;
    border-color: #667eea;
  }
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BackButton = styled.button`
  padding: 1rem;
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const PlaceOrderButton = styled.button`
  padding: 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #059669;
  }
`;
