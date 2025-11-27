import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import { FiPlus, FiEdit, FiTrash2, FiPhone, FiMail, FiMapPin, FiDollarSign } from 'react-icons/fi';
import SupplierFormModal from '@/components/Inventory/SupplierFormModal';
import { Supplier } from '@/models/inventory';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    supplier: Supplier | null;
  }>({ isOpen: false, supplier: null });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/suppliers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupplier = async (data: Partial<Supplier>) => {
    try {
      const token = localStorage.getItem('token');
      const url = formModal.supplier 
        ? `/api/inventory/suppliers/${formModal.supplier.id}`
        : '/api/inventory/suppliers';
      
      const response = await fetch(url, {
        method: formModal.supplier ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await fetchSuppliers();
        setFormModal({ isOpen: false, supplier: null });
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
      throw error;
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa nhà cung cấp này?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inventory/suppliers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchSuppliers();
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container>
          <LoadingMessage>Đang tải...</LoadingMessage>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>🏢 Nhà Cung Cấp</Title>
          <AddButton onClick={() => setFormModal({ isOpen: true, supplier: null })}>
            <FiPlus /> Thêm NCC
          </AddButton>
        </Header>

        <Grid>
          {suppliers.map(supplier => (
            <Card key={supplier.id}>
              <CardHeader>
                <SupplierName>{supplier.name}</SupplierName>
                <Actions>
                  <IconButton onClick={() => setFormModal({ isOpen: true, supplier })}>
                    <FiEdit />
                  </IconButton>
                  <IconButton danger onClick={() => handleDeleteSupplier(supplier.id)}>
                    <FiTrash2 />
                  </IconButton>
                </Actions>
              </CardHeader>
              
              <Info>
                <InfoItem>
                  <FiMail /> {supplier.email}
                </InfoItem>
                <InfoItem>
                  <FiPhone /> {supplier.phone}
                </InfoItem>
              </Info>

              <Stats>
                <StatItem>
                  <StatLabel>Đơn hàng</StatLabel>
                  <StatValue>{supplier.totalOrders || 0}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Tổng giá trị</StatLabel>
                  <StatValue>{(supplier.totalValue || 0).toLocaleString()}₫</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Đánh giá</StatLabel>
                  <StatValue>⭐ {supplier.rating || 0}/5</StatValue>
                </StatItem>
              </Stats>
            </Card>
          ))}
        </Grid>

        {suppliers.length === 0 && (
          <EmptyState>
            <EmptyIcon>🏢</EmptyIcon>
            <EmptyText>Chưa có nhà cung cấp nào</EmptyText>
            <AddButton onClick={() => setFormModal({ isOpen: true, supplier: null })}>
              <FiPlus /> Thêm nhà cung cấp đầu tiên
            </AddButton>
          </EmptyState>
        )}

        {/* Supplier Form Modal */}
        <SupplierFormModal
          isOpen={formModal.isOpen}
          onClose={() => setFormModal({ isOpen: false, supplier: null })}
          supplier={formModal.supplier}
          onSave={handleSaveSupplier}
        />
      </Container>
    </AdminLayout>
  );
};

const Container = styled.div`padding: 24px; max-width: 1400px; margin: 0 auto;`;
const Header = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;`;
const Title = styled.h1`font-size: 28px; font-weight: 700; color: #111827; margin: 0;`;
const AddButton = styled.button`display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; &:hover { background: #2563eb; }`;
const Grid = styled.div`display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;`;
const Card = styled.div`background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);`;
const CardHeader = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;`;
const SupplierName = styled.h3`font-size: 18px; font-weight: 600; color: #111827; margin: 0;`;
const Actions = styled.div`display: flex; gap: 8px;`;
const IconButton = styled.button<{ danger?: boolean }>`width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: ${props => props.danger ? '#fef2f2' : '#f3f4f6'}; color: ${props => props.danger ? '#ef4444' : '#6b7280'}; border: none; border-radius: 6px; cursor: pointer; &:hover { background: ${props => props.danger ? '#fee2e2' : '#e5e7eb'}; }`;
const Info = styled.div`display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;`;
const InfoItem = styled.div`display: flex; align-items: center; gap: 8px; font-size: 14px; color: #6b7280; svg { color: #9ca3af; }`;
const Stats = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;`;
const StatItem = styled.div`text-align: center;`;
const StatLabel = styled.div`font-size: 12px; color: #6b7280; margin-bottom: 4px;`;
const StatValue = styled.div`font-size: 16px; font-weight: 600; color: #111827;`;
const EmptyState = styled.div`text-align: center; padding: 80px 20px; background: white; border-radius: 12px;`;
const EmptyIcon = styled.div`font-size: 64px; margin-bottom: 16px;`;
const EmptyText = styled.div`font-size: 16px; color: #6b7280; margin-bottom: 24px;`;
const LoadingMessage = styled.div`text-align: center; padding: 80px 20px; font-size: 18px; color: #6b7280;`;

export default SuppliersPage;
