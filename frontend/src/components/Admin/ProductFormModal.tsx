import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';



interface Product {
  name?: string;
  sku?: string;
  collection?: string;
  price?: number;
  salePrice?: number;
  stock?: number;
  category?: string;
  description?: string;
  status?: string;
  images?: string[];
  brand?: string;
  material?: string;
  careInstructions?: string;
  origin?: string;
  colors?: string[];
  sizes?: string[];
  specifications?: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  product?: Product;
  mode: 'create' | 'edit';
}

export default function ProductFormModal({ isOpen, onClose, onSubmit, product, mode }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    collection: '',
    price: '',
    salePrice: '',
    stock: '',
    category: '',
    description: '',
    status: 'active',
    images: [] as string[],
    brand: '',
    material: '',
    careInstructions: '',
    origin: '',
    colors: [] as string[],
    sizes: [] as string[],
    specifications: ''
  });
  
  const [collections, setCollections] = useState<string[]>([]);
  
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [summarizing, setSummarizing] = useState(false);
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');

  // Load collections from products
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          const collectionsSet = new Set(
            data.products
              .map((p: any) => p.collection)
              .filter((c: string) => c && c.trim())
          );
          const uniqueCollections = Array.from(collectionsSet).sort() as string[];
          setCollections(uniqueCollections);
        }
      } catch (error) {
        console.error('Error loading collections:', error);
      }
    };
    loadCollections();
  }, []);

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name || '',
        collection: product.collection || '',
        price: product.price?.toString() || '',
        salePrice: product.salePrice?.toString() || '',
        stock: product.stock?.toString() || '',
        category: product.category || '',
        description: product.description || '',
        status: product.status || 'active',
        images: product.images || [],
        brand: product.brand || '',
        material: product.material || '',
        careInstructions: product.careInstructions || '',
        origin: product.origin || '',
        colors: product.colors || [],
        sizes: product.sizes || [],
        specifications: product.specifications || ''
      });
      setImagePreview(product.images || []);
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        collection: '',
        price: '',
        salePrice: '',
        stock: '',
        category: '',
        description: '',
        status: 'active',
        images: [],
        brand: '',
        material: '',
        careInstructions: '',
        origin: '',
        colors: [],
        sizes: [],
        specifications: ''
      });
      setImagePreview([]);
    }
  }, [product, mode, isOpen]);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const newImages: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        await new Promise((resolve) => {
          reader.onloadend = () => {
            const base64 = reader.result as string;
            newImages.push(base64);
            resolve(null);
          };
          reader.readAsDataURL(file);
        });
      }
      
      const updatedImages = [...formData.images, ...newImages];
      setFormData({ ...formData, images: updatedImages });
      setImagePreview(updatedImages);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
    setImagePreview(updatedImages);
  };

  const handleSummarizeDescription = async () => {
    if (!formData.description || formData.description.length < 50) {
      alert('Mô tả quá ngắn để rút gọn. Vui lòng nhập mô tả dài hơn.');
      return;
    }
    
    setSummarizing(true);
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: formData.description })
      });
      
      const data = await response.json();
      if (data.success) {
        setFormData({ ...formData, description: data.summary });
      } else {
        // Fallback: Simple summarization
        const sentences = formData.description.split(/[.!?]+/).filter(s => s.trim());
        const summary = sentences.slice(0, 3).join('. ') + '.';
        setFormData({ ...formData, description: summary });
      }
    } catch (error) {
      console.error('Summarize error:', error);
      // Fallback: Simple summarization
      const sentences = formData.description.split(/[.!?]+/).filter(s => s.trim());
      const summary = sentences.slice(0, 3).join('. ') + '.';
      setFormData({ ...formData, description: summary });
    } finally {
      setSummarizing(false);
    }
  };
  
  const generateSpecifications = () => {
    const specs: string[] = [];
    
    if (formData.brand) specs.push(`Thương hiệu: ${formData.brand}`);
    if (formData.material) specs.push(`Chất liệu: ${formData.material}`);
    if (formData.origin) specs.push(`Xuất xứ: ${formData.origin}`);
    if (formData.colors.length > 0) specs.push(`Màu sắc: ${formData.colors.join(', ')}`);
    if (formData.sizes.length > 0) specs.push(`Size: ${formData.sizes.join(', ')}`);
    if (formData.careInstructions) specs.push(`Bảo quản: ${formData.careInstructions}`);
    
    return specs.join('\n');
  };
  
  const handleAddColor = () => {
    if (colorInput.trim() && !formData.colors.includes(colorInput.trim())) {
      setFormData({ ...formData, colors: [...formData.colors, colorInput.trim()] });
      setColorInput('');
    }
  };
  
  const handleRemoveColor = (color: string) => {
    setFormData({ ...formData, colors: formData.colors.filter(c => c !== color) });
  };
  
  const handleAddSize = () => {
    if (sizeInput.trim() && !formData.sizes.includes(sizeInput.trim())) {
      setFormData({ ...formData, sizes: [...formData.sizes, sizeInput.trim()] });
      setSizeInput('');
    }
  };
  
  const handleRemoveSize = (size: string) => {
    setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== size) });
  };
  
  // Auto-generate specifications when relevant fields change
  useEffect(() => {
    const specs = generateSpecifications();
    setFormData(prev => ({ ...prev, specifications: specs }));
  }, [formData.brand, formData.material, formData.origin, formData.colors, formData.sizes, formData.careInstructions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
      stock: parseInt(formData.stock) || 0
    };

    onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContainer
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <ModalTitle>
              {mode === 'create' ? '➕ Thêm Sản Phẩm Mới' : '✏️ Sửa Sản Phẩm'}
            </ModalTitle>
            <CloseButton onClick={onClose}>
              <FiX />
            </CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormRow>
                <FormGroup>
                  <Label>Tên sản phẩm <Required>*</Required></Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nhập tên sản phẩm"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Bộ sưu tập</Label>
                  <Select
                    name="collection"
                    value={formData.collection}
                    onChange={handleChange}
                  >
                    <option value="">Chọn hoặc nhập bộ sưu tập</option>
                    {collections.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </Select>
                  <HelpText>Hoặc nhập tên mới:</HelpText>
                  <Input
                    type="text"
                    placeholder="Nhập tên bộ sưu tập mới..."
                    value={formData.collection && !collections.includes(formData.collection) ? formData.collection : ''}
                    onChange={(e) => setFormData({...formData, collection: e.target.value})}
                  />
                  <HelpText style={{fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem'}}>
                    Mã sản phẩm (SKU) sẽ tự động tạo khi lưu
                  </HelpText>
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Giá bán <Required>*</Required></Label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    min="0"
                  />
                  <Helper>VNĐ</Helper>
                </FormGroup>

                <FormGroup>
                  <Label>Giá khuyến mãi</Label>
                  <Input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />
                  <Helper>VNĐ (Để trống nếu không có)</Helper>
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Tồn kho <Required>*</Required></Label>
                  <Input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    min="0"
                  />
                  <Helper>Số lượng</Helper>
                </FormGroup>

                <FormGroup>
                  <Label>Danh mục</Label>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="Áo">Áo</option>
                    <option value="Quần">Quần</option>
                    <option value="Váy">Váy</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                    <option value="Giày dép">Giày dép</option>
                  </Select>
                </FormGroup>
              </FormRow>

              <FormGroup>
                <LabelWithButton>
                  <Label>Mô tả</Label>
                  <AIButton
                    type="button"
                    onClick={handleSummarizeDescription}
                    disabled={summarizing || !formData.description}
                  >
                    {summarizing ? '⏳ Đang rút gọn...' : '🤖 AI Rút gọn'}
                  </AIButton>
                </LabelWithButton>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết sản phẩm..."
                  rows={4}
                />
                <Helper>Nhập mô tả dài, sau đó click "AI Rút gọn" để chỉ giữ lại các ý chính</Helper>
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>Thương hiệu</Label>
                  <Input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Nhập tên thương hiệu"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Chất liệu</Label>
                  <Input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    placeholder="VD: Cotton 100%, Polyester..."
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Xuất xứ</Label>
                  <Input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    placeholder="VD: Việt Nam, Hàn Quốc..."
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Hướng dẫn bảo quản</Label>
                <Textarea
                  name="careInstructions"
                  value={formData.careInstructions}
                  onChange={handleChange}
                  placeholder="VD: Giặt máy ở nhiệt độ thường, không dùng chất tẩy..."
                  rows={3}
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>Màu sắc</Label>
                  <TagInputContainer>
                    <TagInput
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                      placeholder="Nhập màu và Enter"
                    />
                    <AddTagButton type="button" onClick={handleAddColor}>
                      + Thêm
                    </AddTagButton>
                  </TagInputContainer>
                  {formData.colors.length > 0 && (
                    <TagList>
                      {formData.colors.map((color, index) => (
                        <Tag key={index}>
                          {color}
                          <RemoveTag onClick={() => handleRemoveColor(color)}>✕</RemoveTag>
                        </Tag>
                      ))}
                    </TagList>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Size</Label>
                  <TagInputContainer>
                    <TagInput
                      type="text"
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                      placeholder="Nhập size và Enter"
                    />
                    <AddTagButton type="button" onClick={handleAddSize}>
                      + Thêm
                    </AddTagButton>
                  </TagInputContainer>
                  {formData.sizes.length > 0 && (
                    <TagList>
                      {formData.sizes.map((size, index) => (
                        <Tag key={index}>
                          {size}
                          <RemoveTag onClick={() => handleRemoveSize(size)}>✕</RemoveTag>
                        </Tag>
                      ))}
                    </TagList>
                  )}
                  <Helper>VD: S, M, L, XL, XXL hoặc 36, 37, 38...</Helper>
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Thông tin chi tiết (Tự động)</Label>
                <Textarea
                  value={formData.specifications}
                  readOnly
                  placeholder="Thông tin chi tiết sẽ tự động cập nhật từ các trường trên..."
                  rows={5}
                  style={{ background: '#f9fafb', cursor: 'not-allowed' }}
                />
                <Helper>Thông số này tự động tạo từ: Thương hiệu, Chất liệu, Xuất xứ, Màu sắc, Size, Bảo quản</Helper>
              </FormGroup>

              <FormGroup>
                <Label>Hình ảnh sản phẩm</Label>
                <ImageUploadSection>
                  <ImageUploadButton as="label">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                    {uploading ? '⏳ Đang tải...' : '📷 Chọn ảnh'}
                  </ImageUploadButton>
                  <Helper>Chọn nhiều ảnh (JPG, PNG). Ảnh đầu tiên sẽ là ảnh đại diện.</Helper>
                </ImageUploadSection>

                {imagePreview.length > 0 && (
                  <ImagePreviewGrid>
                    {imagePreview.map((img, index) => (
                      <ImagePreviewItem key={index}>
                        <PreviewImage src={img} alt={`Preview ${index + 1}`} />
                        <RemoveImageButton
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                        >
                          ✕
                        </RemoveImageButton>
                        {index === 0 && <PrimaryBadge>Ảnh chính</PrimaryBadge>}
                      </ImagePreviewItem>
                    ))}
                  </ImagePreviewGrid>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Trạng thái</Label>
                <RadioGroup>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={handleChange}
                    />
                    <span>Đang bán</span>
                  </RadioLabel>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={handleChange}
                    />
                    <span>Tạm dừng</span>
                  </RadioLabel>
                </RadioGroup>
              </FormGroup>
            </ModalBody>

            <ModalFooter>
              <CancelButton type="button" onClick={onClose}>
                Hủy
              </CancelButton>
              <SubmitButton type="submit">
                {mode === 'create' ? '✅ Thêm Sản Phẩm' : '💾 Lưu Thay Đổi'}
              </SubmitButton>
            </ModalFooter>
          </Form>
        </ModalContainer>
      </Overlay>
    </AnimatePresence>
  );
}

// Styled Components
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
`;

const ModalContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #4b5563;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Required = styled.span`
  color: #ef4444;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const HelpText = styled.p`
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: #6b7280;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Helper = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  input[type="radio"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  span {
    font-size: 0.875rem;
    color: #374151;
  }
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #4b5563;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

const ImageUploadSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ImageUploadButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #e5e7eb;
    border-color: #9ca3af;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ImagePreviewItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: rgba(220, 38, 38, 1);
    transform: scale(1.1);
  }
`;

const PrimaryBadge = styled.div`
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
`;

const LabelWithButton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const AIButton = styled.button`
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TagInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const TagInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const AddTagButton = styled.button`
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
  }
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: #eff6ff;
  color: #1e40af;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const RemoveTag = styled.button`
  background: none;
  border: none;
  color: #1e40af;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  line-height: 1;
  transition: color 0.2s;

  &:hover {
    color: #dc2626;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;
