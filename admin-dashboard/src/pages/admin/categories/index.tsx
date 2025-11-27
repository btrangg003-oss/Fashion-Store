import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AdminLayout from '../../../components/Admin/Layout/AdminLayout';
import ProtectedAdminRoute from '../../../components/Admin/Auth/ProtectedAdminRoute';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TabsContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  margin-right: 1rem;
  border: none;
  background: ${props => props.active ? '#3b82f6' : 'transparent'};
  color: ${props => props.active ? 'white' : '#4b5563'};
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.active ? '#2563eb' : '#f3f4f6'};
  }
`;

interface ButtonProps {
  variant?: 'danger' | 'primary';
}

const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  background: ${props => props.variant === 'danger' ? '#ef4444' : '#3b82f6'};
  color: white;
  border: none;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const CardTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #1a1c23;
`;

const CardMeta = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

interface Brand {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

const CategoriesAndBrandsPage = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'brands'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Category | Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'categories') {
        const response = await fetch('/api/admin/categories');
        const data = await response.json();
        setCategories(data);
      } else {
        const response = await fetch('/api/admin/brands');
        const data = await response.json();
        setBrands(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Category | Brand) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa?')) {
      try {
        await fetch(`/api/admin/${activeTab}/${id}`, { method: 'DELETE' });
        await fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get('name'),
      description: formData.get('description')
    };

    try {
      if (selectedItem) {
        await fetch(`/api/admin/${activeTab}/${selectedItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        await fetch(`/api/admin/${activeTab}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      
      setIsModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div>Đang tải...</div>
      </AdminLayout>
    );
  }

  return (
    <ProtectedAdminRoute>
      <AdminLayout>
        <PageHeader>
          <h1>{activeTab === 'categories' ? 'Quản lý danh mục' : 'Quản lý thương hiệu'}</h1>
          <Button onClick={handleAdd}>
            <FiPlus /> {activeTab === 'categories' ? 'Thêm danh mục' : 'Thêm thương hiệu'}
          </Button>
        </PageHeader>

        <TabsContainer>
          <TabButton 
            active={activeTab === 'categories'} 
            onClick={() => setActiveTab('categories')}
          >
            Danh mục
          </TabButton>
          <TabButton 
            active={activeTab === 'brands'} 
            onClick={() => setActiveTab('brands')}
          >
            Thương hiệu
          </TabButton>
        </TabsContainer>

        <Grid>
          {(activeTab === 'categories' ? categories : brands).map((item) => (
            <Card key={item.id}>
              <CardTitle>{item.name}</CardTitle>
              <CardMeta>
                {item.productCount} sản phẩm
              </CardMeta>
              <Actions>
                <Button onClick={() => handleEdit(item)}>
                  <FiEdit2 /> Sửa
                </Button>
                <Button variant="danger" onClick={() => handleDelete(item.id)}>
                  <FiTrash2 /> Xóa
                </Button>
              </Actions>
            </Card>
          ))}
        </Grid>

        {isModalOpen && (
          <Modal onClick={() => setIsModalOpen(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <h2>
                {selectedItem
                  ? `Sửa ${activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}`
                  : `Thêm ${activeTab === 'categories' ? 'danh mục' : 'thương hiệu'} mới`}
              </h2>
              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Tên</Label>
                  <Input
                    name="name"
                    defaultValue={selectedItem?.name}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Mô tả</Label>
                  <TextArea
                    name="description"
                    defaultValue={selectedItem?.description}
                  />
                </FormGroup>

                <Actions>
                  <Button type="submit">
                    {selectedItem ? 'Cập nhật' : 'Thêm mới'}
                  </Button>
                  <Button variant="danger" type="button" onClick={() => setIsModalOpen(false)}>
                    Hủy
                  </Button>
                </Actions>
              </form>
            </ModalContent>
          </Modal>
        )}
      </AdminLayout>
    </ProtectedAdminRoute>
  );
};

export default CategoriesAndBrandsPage;