import React, { useState } from 'react';
import styled from 'styled-components';

import { FiPlus, FiImage, FiTag, FiPackage, FiDollarSign, FiX, FiTrash2, FiUpload } from 'react-icons/fi';

interface ProductFormAdvancedProps {
  product?: unknown;
  onSubmit: (data: unknown) => void;
  onCancel: () => void;
}

const ProductFormAdvanced: React.FC<ProductFormAdvancedProps> = ({
  product,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    originalPrice: product?.originalPrice || '',
    category: product?.category || '',
    brand: product?.brand || '',
    stock: product?.stock || '',
    sku: product?.sku || '',
    tags: product?.tags || [],
    variants: product?.variants || [],
    images: product?.images || [],
    seo: {
      title: product?.seo?.title || '',
      description: product?.seo?.description || '',
      keywords: product?.seo?.keywords || ''
    },
    bulkPricing: product?.bulkPricing || [],
    relatedProducts: product?.relatedProducts || []
  });

  const [currentTab, setCurrentTab] = useState('basic');
  const [newTag, setNewTag] = useState('');
  const [newVariant, setNewVariant] = useState({ name: '', values: '' });
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSEOChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, [field]: value }
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_: string, i: number) => i !== index)
    }));
  };

  const handleAddVariant = () => {
    if (newVariant.name && newVariant.values) {
      const values = newVariant.values.split(',').map(v => v.trim());
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, { ...newVariant, values }]
      }));
      setNewVariant({ name: '', values: '' });
    }
  };

  const handleRemoveVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_: unknown, i: number) => i !== index)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Xử lý upload ảnh
    console.log('Uploading images:', files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    console.log('Dropped files:', files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Tabs>
        <Tab active={currentTab === 'basic'} onClick={() => setCurrentTab('basic')}>
          <FiPackage /> Thông tin cơ bản
        </Tab>
        <Tab active={currentTab === 'variants'} onClick={() => setCurrentTab('variants')}>
          <FiTag /> Biến thể
        </Tab>
        <Tab active={currentTab === 'images'} onClick={() => setCurrentTab('images')}>
          <FiImage /> Hình ảnh
        </Tab>
        <Tab active={currentTab === 'seo'} onClick={() => setCurrentTab('seo')}>
          SEO
        </Tab>
        <Tab active={currentTab === 'pricing'} onClick={() => setCurrentTab('pricing')}>
          <FiDollarSign /> Giá
        </Tab>
      </Tabs>

      <TabContent>
        {currentTab === 'basic' && (
          <TabPanel>
            <FormGroup>
              <Label>Tên sản phẩm *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nhập tên sản phẩm"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả chi tiết sản phẩm"
                rows={5}
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>Danh mục *</Label>
                <Select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  <option value="ao">Áo</option>
                  <option value="quan">Quần</option>
                  <option value="vay">Váy</option>
                  <option value="phu-kien">Phụ kiện</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Thương hiệu</Label>
                <Input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  placeholder="Tên thương hiệu"
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>SKU</Label>
                <Input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  placeholder="Mã SKU"
                />
              </FormGroup>

              <FormGroup>
                <Label>Tồn kho *</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleChange('stock', e.target.value)}
                  placeholder="Số lượng"
                  required
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Tags</Label>
              <TagsContainer>
                {formData.tags.map((tag: string, index: number) => (
                  <Tag key={index}>
                    {tag}
                    <RemoveTagButton onClick={() => handleRemoveTag(index)}>
                      <FiX />
                    </RemoveTagButton>
                  </Tag>
                ))}
                <TagInput
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Thêm tag..."
                />
                <AddTagButton type="button" onClick={handleAddTag}>
                  <FiPlus />
                </AddTagButton>
              </TagsContainer>
            </FormGroup>
          </TabPanel>
        )}

        {currentTab === 'variants' && (
          <TabPanel>
            <VariantForm>
              <FormRow>
                <FormGroup>
                  <Label>Tên biến thể</Label>
                  <Input
                    type="text"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                    placeholder="VD: Size, Màu sắc"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Giá trị (phân cách bằng dấu phẩy)</Label>
                  <Input
                    type="text"
                    value={newVariant.values}
                    onChange={(e) => setNewVariant({ ...newVariant, values: e.target.value })}
                    placeholder="VD: S, M, L, XL"
                  />
                </FormGroup>
              </FormRow>
              <AddButton type="button" onClick={handleAddVariant}>
                <FiPlus /> Thêm biến thể
              </AddButton>
            </VariantForm>

            <VariantsList>
              {formData.variants.map((variant: unknown, index: number) => (
                <VariantItem key={index}>
                  <VariantInfo>
                    <VariantName>{variant.name}</VariantName>
                    <VariantValues>
                      {Array.isArray(variant.values) 
                        ? variant.values.join(', ')
                        : variant.values
                      }
                    </VariantValues>
                  </VariantInfo>
                  <DeleteButton type="button" onClick={() => handleRemoveVariant(index)}>
                    <FiTrash2 />
                  </DeleteButton>
                </VariantItem>
              ))}
            </VariantsList>
          </TabPanel>
        )}

        {currentTab === 'images' && (
          <TabPanel>
            <UploadArea
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              dragActive={dragActive}
            >
              <UploadIcon><FiUpload /></UploadIcon>
              <UploadText>Kéo thả ảnh vào đây hoặc</UploadText>
              <UploadButton type="button" onClick={() => document.getElementById('file-input')?.click()}>
                Chọn ảnh
              </UploadButton>
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </UploadArea>

            <ImageGrid>
              {formData.images.map((image: unknown, index: number) => (
                <ImagePreview key={index}>
                  <img src={image.url || image} alt={`Product ${index + 1}`} />
                  <RemoveImageButton onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      images: prev.images.filter((_: unknown, i: number) => i !== index)
                    }));
                  }}>
                    <FiX />
                  </RemoveImageButton>
                </ImagePreview>
              ))}
            </ImageGrid>
          </TabPanel>
        )}

        {currentTab === 'seo' && (
          <TabPanel>
            <FormGroup>
              <Label>SEO Title</Label>
              <Input
                type="text"
                value={formData.seo.title}
                onChange={(e) => handleSEOChange('title', e.target.value)}
                placeholder="Tiêu đề SEO"
              />
              <Helper>Tối đa 60 ký tự</Helper>
            </FormGroup>

            <FormGroup>
              <Label>SEO Description</Label>
              <Textarea
                value={formData.seo.description}
                onChange={(e) => handleSEOChange('description', e.target.value)}
                placeholder="Mô tả SEO"
                rows={3}
              />
              <Helper>Tối đa 160 ký tự</Helper>
            </FormGroup>

            <FormGroup>
              <Label>SEO Keywords</Label>
              <Input
                type="text"
                value={formData.seo.keywords}
                onChange={(e) => handleSEOChange('keywords', e.target.value)}
                placeholder="Từ khóa SEO (phân cách bằng dấu phẩy)"
              />
            </FormGroup>
          </TabPanel>
        )}

        {currentTab === 'pricing' && (
          <TabPanel>
            <FormRow>
              <FormGroup>
                <Label>Giá bán *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="Giá bán"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Giá gốc</Label>
                <Input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => handleChange('originalPrice', e.target.value)}
                  placeholder="Giá gốc"
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Giá theo số lượng (Bulk Pricing)</Label>
              <Helper>Thiết lập giá ưu đãi khi mua số lượng lớn</Helper>
              {/* Bulk pricing form sẽ được thêm sau */}
            </FormGroup>
          </TabPanel>
        )}
      </TabContent>

      <FormActions>
        <CancelButton type="button" onClick={onCancel}>
          Hủy
        </CancelButton>
        <SubmitButton type="submit">
          {product ? 'Cập nhật' : 'Tạo mới'}
        </SubmitButton>
      </FormActions>
    </Form>
  );
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background: #f9f9f9;
  overflow-x: auto;
`;

const Tab = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#667eea' : '#666'};
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#667eea' : 'transparent'};
  transition: all 0.3s;
  white-space: nowrap;

  &:hover {
    background: white;
  }
`;

const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
`;

const TabPanel = styled.div``;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Helper = styled.div`
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #999;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  min-height: 50px;
`;

const Tag = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  background: #667eea;
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;

  &:hover {
    opacity: 0.8;
  }
`;

const TagInput = styled.input`
  flex: 1;
  min-width: 150px;
  border: none;
  outline: none;
  font-size: 0.9rem;
`;

const AddTagButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: #5568d3;
  }
`;

const VariantForm = styled.div`
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #5568d3;
  }
`;

const VariantsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const VariantItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const VariantInfo = styled.div`
  flex: 1;
`;

const VariantName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
`;

const VariantValues = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const DeleteButton = styled.button`
  background: #fee;
  color: #ef4444;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: #fdd;
  }
`;

const UploadArea = styled.div<{ dragActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  border: 2px dashed ${props => props.dragActive ? '#667eea' : '#ddd'};
  border-radius: 12px;
  background: ${props => props.dragActive ? '#f0f4ff' : '#f9f9f9'};
  margin-bottom: 2rem;
  transition: all 0.3s;
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
`;

const UploadText = styled.div`
  color: #666;
  margin-bottom: 1rem;
`;

const UploadButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #5568d3;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const ImagePreview = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: rgba(239, 68, 68, 1);
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
  background: #f9f9f9;
`;

const CancelButton = styled.button`
  padding: 0.75rem 2rem;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

export default ProductFormAdvanced;
