import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FiCamera, FiUpload, FiX, FiImage, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface PhotoItem {
  id: string;
  url: string;
  file?: File;
  type: 'before' | 'after' | 'label' | 'quality';
  uploadedAt: string;
  notes?: string;
}

interface PhotoVerificationProps {
  outboundId: string;
  onPhotosChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
}

const PhotoVerification: React.FC<PhotoVerificationProps> = ({
  outboundId,
  onPhotosChange,
  maxPhotos = 10
}) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const qualityInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    files: FileList | null,
    type: 'before' | 'after' | 'label' | 'quality'
  ) => {
    if (!files || files.length === 0) return;

    // Check max photos limit
    if (photos.length + files.length > maxPhotos) {
      setError(`Chỉ được upload tối đa ${maxPhotos} ảnh`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const newPhotos: PhotoItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError(`File ${file.name} không phải là ảnh`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError(`File ${file.name} quá lớn (tối đa 5MB)`);
          continue;
        }

        // Create preview URL
        const url = URL.createObjectURL(file);

        // In production, upload to cloud storage (S3, Cloudinary, etc.)
        // For now, we'll use local preview
        const photoItem: PhotoItem = {
          id: `photo_${Date.now()}_${i}`,
          url,
          file,
          type,
          uploadedAt: new Date().toISOString()
        };

        newPhotos.push(photoItem);
      }

      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      onPhotosChange(updatedPhotos);

    } catch (err) {
      console.error('Error uploading photos:', err);
      setError('Có lỗi xảy ra khi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (photo?.url.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url);
    }

    const updatedPhotos = photos.filter(p => p.id !== photoId);
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
  };

  const handleCameraCapture = (type: 'before' | 'after' | 'label' | 'quality') => {
    // Trigger file input with camera
    const inputRef = {
      before: beforeInputRef,
      after: afterInputRef,
      label: labelInputRef,
      quality: qualityInputRef
    }[type];

    inputRef.current?.click();
  };

  const getTypeLabel = (type: string) => {
    const labels: any = {
      before: 'Trước đóng gói',
      after: 'Sau đóng gói',
      label: 'Nhãn vận chuyển',
      quality: 'Kiểm tra chất lượng'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: any = {
      before: '📦',
      after: '✅',
      label: '🏷️',
      quality: '🔍'
    };
    return icons[type] || '📷';
  };

  const getTypeColor = (type: string) => {
    const colors: any = {
      before: '#3b82f6',
      after: '#10b981',
      label: '#f59e0b',
      quality: '#8b5cf6'
    };
    return colors[type] || '#6b7280';
  };

  const photosByType = {
    before: photos.filter(p => p.type === 'before'),
    after: photos.filter(p => p.type === 'after'),
    label: photos.filter(p => p.type === 'label'),
    quality: photos.filter(p => p.type === 'quality')
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>
          <FiCamera /> Xác Minh Bằng Ảnh
        </HeaderTitle>
        <PhotoCount>
          {photos.length}/{maxPhotos} ảnh
        </PhotoCount>
      </Header>

      {error && (
        <ErrorMessage>
          <FiAlertCircle /> {error}
        </ErrorMessage>
      )}

      {/* Photo Sections */}
      <PhotoSections>
        {/* Before Packing */}
        <PhotoSection>
          <SectionHeader>
            <SectionTitle color={getTypeColor('before')}>
              {getTypeIcon('before')} {getTypeLabel('before')}
            </SectionTitle>
            <PhotoSectionCount>{photosByType.before.length}</PhotoSectionCount>
          </SectionHeader>

          <UploadArea>
            <HiddenInput
              ref={beforeInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => handleFileSelect(e.target.files, 'before')}
            />
            
            <UploadButton
              onClick={() => handleCameraCapture('before')}
              disabled={uploading}
            >
              <FiCamera /> Chụp ảnh
            </UploadButton>

            <UploadButton
              onClick={() => beforeInputRef.current?.click()}
              disabled={uploading}
              secondary
            >
              <FiUpload /> Tải lên
            </UploadButton>
          </UploadArea>

          {photosByType.before.length > 0 && (
            <PhotoGrid>
              {photosByType.before.map(photo => (
                <PhotoCard key={photo.id}>
                  <PhotoImage src={photo.url} alt="Before packing" />
                  <PhotoOverlay>
                    <RemoveButton onClick={() => handleRemovePhoto(photo.id)}>
                      <FiX />
                    </RemoveButton>
                  </PhotoOverlay>
                  <PhotoTime>
                    {new Date(photo.uploadedAt).toLocaleTimeString('vi-VN')}
                  </PhotoTime>
                </PhotoCard>
              ))}
            </PhotoGrid>
          )}
        </PhotoSection>

        {/* After Packing */}
        <PhotoSection>
          <SectionHeader>
            <SectionTitle color={getTypeColor('after')}>
              {getTypeIcon('after')} {getTypeLabel('after')}
            </SectionTitle>
            <PhotoSectionCount>{photosByType.after.length}</PhotoSectionCount>
          </SectionHeader>

          <UploadArea>
            <HiddenInput
              ref={afterInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => handleFileSelect(e.target.files, 'after')}
            />
            
            <UploadButton
              onClick={() => handleCameraCapture('after')}
              disabled={uploading}
            >
              <FiCamera /> Chụp ảnh
            </UploadButton>

            <UploadButton
              onClick={() => afterInputRef.current?.click()}
              disabled={uploading}
              secondary
            >
              <FiUpload /> Tải lên
            </UploadButton>
          </UploadArea>

          {photosByType.after.length > 0 && (
            <PhotoGrid>
              {photosByType.after.map(photo => (
                <PhotoCard key={photo.id}>
                  <PhotoImage src={photo.url} alt="After packing" />
                  <PhotoOverlay>
                    <RemoveButton onClick={() => handleRemovePhoto(photo.id)}>
                      <FiX />
                    </RemoveButton>
                  </PhotoOverlay>
                  <PhotoTime>
                    {new Date(photo.uploadedAt).toLocaleTimeString('vi-VN')}
                  </PhotoTime>
                </PhotoCard>
              ))}
            </PhotoGrid>
          )}
        </PhotoSection>

        {/* Shipping Label */}
        <PhotoSection>
          <SectionHeader>
            <SectionTitle color={getTypeColor('label')}>
              {getTypeIcon('label')} {getTypeLabel('label')}
            </SectionTitle>
            <PhotoSectionCount>{photosByType.label.length}</PhotoSectionCount>
          </SectionHeader>

          <UploadArea>
            <HiddenInput
              ref={labelInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => handleFileSelect(e.target.files, 'label')}
            />
            
            <UploadButton
              onClick={() => handleCameraCapture('label')}
              disabled={uploading}
            >
              <FiCamera /> Chụp ảnh
            </UploadButton>

            <UploadButton
              onClick={() => labelInputRef.current?.click()}
              disabled={uploading}
              secondary
            >
              <FiUpload /> Tải lên
            </UploadButton>
          </UploadArea>

          {photosByType.label.length > 0 && (
            <PhotoGrid>
              {photosByType.label.map(photo => (
                <PhotoCard key={photo.id}>
                  <PhotoImage src={photo.url} alt="Shipping label" />
                  <PhotoOverlay>
                    <RemoveButton onClick={() => handleRemovePhoto(photo.id)}>
                      <FiX />
                    </RemoveButton>
                  </PhotoOverlay>
                  <PhotoTime>
                    {new Date(photo.uploadedAt).toLocaleTimeString('vi-VN')}
                  </PhotoTime>
                </PhotoCard>
              ))}
            </PhotoGrid>
          )}
        </PhotoSection>

        {/* Quality Check */}
        <PhotoSection>
          <SectionHeader>
            <SectionTitle color={getTypeColor('quality')}>
              {getTypeIcon('quality')} {getTypeLabel('quality')}
            </SectionTitle>
            <PhotoSectionCount>{photosByType.quality.length}</PhotoSectionCount>
          </SectionHeader>

          <UploadArea>
            <HiddenInput
              ref={qualityInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => handleFileSelect(e.target.files, 'quality')}
            />
            
            <UploadButton
              onClick={() => handleCameraCapture('quality')}
              disabled={uploading}
            >
              <FiCamera /> Chụp ảnh
            </UploadButton>

            <UploadButton
              onClick={() => qualityInputRef.current?.click()}
              disabled={uploading}
              secondary
            >
              <FiUpload /> Tải lên
            </UploadButton>
          </UploadArea>

          {photosByType.quality.length > 0 && (
            <PhotoGrid>
              {photosByType.quality.map(photo => (
                <PhotoCard key={photo.id}>
                  <PhotoImage src={photo.url} alt="Quality check" />
                  <PhotoOverlay>
                    <RemoveButton onClick={() => handleRemovePhoto(photo.id)}>
                      <FiX />
                    </RemoveButton>
                  </PhotoOverlay>
                  <PhotoTime>
                    {new Date(photo.uploadedAt).toLocaleTimeString('vi-VN')}
                  </PhotoTime>
                </PhotoCard>
              ))}
            </PhotoGrid>
          )}
        </PhotoSection>
      </PhotoSections>

      {/* Summary */}
      {photos.length > 0 && (
        <Summary>
          <SummaryTitle>
            <FiCheck /> Tổng quan
          </SummaryTitle>
          <SummaryGrid>
            <SummaryItem>
              <SummaryLabel>Tổng số ảnh:</SummaryLabel>
              <SummaryValue>{photos.length}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Trước đóng gói:</SummaryLabel>
              <SummaryValue>{photosByType.before.length}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Sau đóng gói:</SummaryLabel>
              <SummaryValue>{photosByType.after.length}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Nhãn vận chuyển:</SummaryLabel>
              <SummaryValue>{photosByType.label.length}</SummaryValue>
            </SummaryItem>
          </SummaryGrid>
        </Summary>
      )}

      {uploading && (
        <UploadingOverlay>
          <UploadingSpinner />
          <UploadingText>Đang tải ảnh...</UploadingText>
        </UploadingOverlay>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const PhotoCount = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PhotoSections = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const PhotoSection = styled.div`
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.div<{ color: string }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PhotoSectionCount = styled.div`
  padding: 4px 10px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
`;

const UploadArea = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadButton = styled.button<{ secondary?: boolean }>`
  flex: 1;
  padding: 10px 16px;
  background: ${props => props.secondary ? 'white' : '#3b82f6'};
  color: ${props => props.secondary ? '#3b82f6' : 'white'};
  border: ${props => props.secondary ? '2px solid #3b82f6' : 'none'};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  
  &:hover:not(:disabled) {
    background: ${props => props.secondary ? '#eff6ff' : '#2563eb'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const PhotoCard = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  
  &:hover {
    border-color: #3b82f6;
  }
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PhotoOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${PhotoCard}:hover & {
    opacity: 1;
  }
`;

const RemoveButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  
  &:hover {
    background: #dc2626;
  }
`;

const PhotoTime = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
`;

const Summary = styled.div`
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
`;

const SummaryTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SummaryLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const SummaryValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
`;

const UploadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 1000;
`;

const UploadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const UploadingText = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 600;
`;

export default PhotoVerification;
export type { PhotoItem };
