import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiPlus, FiMail, FiDownload, FiSettings,
  FiPackage, FiUsers, FiBarChart, FiTag
} from 'react-icons/fi';
import Link from 'next/link';

const ActionsContainer = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ActionsHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const ActionsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

const ActionsSubtitle = styled.p`
  color: #64748b;
  font-size: 0.875rem;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButton = styled(motion.button)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  color: inherit;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ActionIcon = styled.div<{ bgColor: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
`;

const ActionLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a202c;
  text-align: center;
`;

const ActionDescription = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
  line-height: 1.4;
`;

const actions = [
  {
    id: 'add-product',
    label: 'Thêm sản phẩm',
    description: 'Thêm sản phẩm mới vào cửa hàng',
    icon: FiPlus,
    bgColor: '#3b82f6',
    href: '/admin/products/new'
  },
  {
    id: 'send-email',
    label: 'Gửi email',
    description: 'Gửi email marketing đến khách hàng',
    icon: FiMail,
    bgColor: '#10b981',
    href: '/admin/email/compose'
  },
  {
    id: 'export-data',
    label: 'Xuất báo cáo',
    description: 'Tải xuống báo cáo doanh thu',
    icon: FiDownload,
    bgColor: '#f59e0b',
    action: 'export'
  },
  {
    id: 'manage-orders',
    label: 'Quản lý đơn hàng',
    description: 'Xem và xử lý đơn hàng mới',
    icon: FiPackage,
    bgColor: '#8b5cf6',
    href: '/admin/orders'
  },
  {
    id: 'customer-support',
    label: 'Hỗ trợ khách hàng',
    description: 'Trả lời câu hỏi từ khách hàng',
    icon: FiUsers,
    bgColor: '#ef4444',
    href: '/admin/support'
  },
  {
    id: 'analytics',
    label: 'Xem thống kê',
    description: 'Phân tích chi tiết doanh thu',
    icon: FiBarChart,
    bgColor: '#06b6d4',
    href: '/admin/analytics'
  },
  {
    id: 'promotions',
    label: 'Tạo khuyến mãi',
    description: 'Thiết lập chương trình giảm giá',
    icon: FiTag,
    bgColor: '#84cc16',
    href: '/admin/promotions'
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    description: 'Cấu hình hệ thống',
    icon: FiSettings,
    bgColor: '#64748b',
    href: '/admin/settings'
  }
];

export default function QuickActions() {
  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/export-report');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bao-cao-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const handleActionClick = (action: typeof actions[0]) => {
    if (action.action === 'export') {
      handleExport();
    }
  };

  return (
    <ActionsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <ActionsHeader>
        <ActionsTitle>Thao tác nhanh</ActionsTitle>
        <ActionsSubtitle>
          Các tác vụ thường dùng để quản lý cửa hàng hiệu quả
        </ActionsSubtitle>
      </ActionsHeader>

      <ActionsGrid>
        {actions.map((action, index) => {
          if (action.href) {
            return (
              <Link key={action.id} href={action.href}>
                <ActionButton
                  as="a"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ActionIcon bgColor={action.bgColor}>
                    <action.icon />
                  </ActionIcon>
                  <ActionLabel>{action.label}</ActionLabel>
                  <ActionDescription>{action.description}</ActionDescription>
                </ActionButton>
              </Link>
            );
          }

          return (
            <ActionButton
              key={action.id}
              as="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleActionClick(action)}
            >
              <ActionIcon bgColor={action.bgColor}>
                <action.icon />
              </ActionIcon>
              <ActionLabel>{action.label}</ActionLabel>
              <ActionDescription>{action.description}</ActionDescription>
            </ActionButton>
          );
        })}
      </ActionsGrid>
    </ActionsContainer>
  );
}