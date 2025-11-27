import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { FaImage, FaTrash, FaCloudUploadAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadZoneProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 5
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/reviews/upload-image', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const processFiles = async (files: FileList | File[]) => {
    setError('');
    
    const fileArray = Array.from(files);
    
    // Check total count
    if (images.length + fileArray.length > maxImages) {
      setError(`Tối đa ${maxImages} ảnh`);
      return;
    }

    // Validate each file
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        setError('Chỉ chấp nhận file ảnh');
        return;
      }
      
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Kích thước ảnh tối đa ${maxSizeMB}MB`);
        return;
      }
    }

    // Upload images
    setUploading(true);
    try {
      const uploadPromises = fileArray.map(file => uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...urls]);
    } catch (err) {
      setError('Lỗi upload ảnh. Vui lòng thử lại.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFiles(files);
    }
  }, [images, maxImages, maxSizeMB]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
    // Reset input
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <Container>
      <Label>
        <FaImage /> Thêm ảnh (Tối đa {maxImages} ảnh)
        {images.length > 0 && <Count>{images.length}/{maxImages}</Count>}
      </Label>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <ImagesGrid>
        <AnimatePresence>
          {images.map((url, index) => (
            <ImagePreview
              key={url}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <img src={url} alt={`Preview ${index + 1}`} />
              <RemoveButton onClick={() => handleRemove(index)}>
                <FaTrash />
              </RemoveButton>
            </ImagePreview>
          ))}
        </AnimatePresence>

        {images.length < maxImages && (
          <UploadZone
            $isDragging={isDragging}
            $isUploading={uploading}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              {uploading ? (
                <>
                  <Spinner />
                  <UploadText>Đang tải...</UploadText>
                </>
              ) : (
                <>
                  <FaCloudUploadAlt size={32} />
                  <UploadText>
                    Kéo thả ảnh vào đây<br />
                    hoặc click để chọn
                  </UploadText>
                  <UploadHint>JPG, PNG, GIF (max {maxSizeMB}MB)</UploadHint>
                </>
              )}
            </label>
          </UploadZone>
        )}
      </ImagesGrid>

      <PointsHint>
        💡 <strong>Mẹo:</strong> Thêm ảnh để nhận thêm điểm thưởng!
        <PointsBreakdown>
          • Không có ảnh: +30 điểm<br />
          • 1-2 ảnh: +50 điểm<br />
          • 3+ ảnh: +100 điểm
        </PointsBreakdown>
      </PointsHint>
    </Container>
  );
};

const Container = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #667eea;
  }
`;

const Count = styled.span`
  margin-left: auto;
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 12px;
  border-left: 3px solid #c33;
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
`;

const ImagePreview = styled(motion.div)`
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
  background: #f9f9f9;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover button {
    opacity: 1;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 0, 0, 0.9);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 12px;

  &:hover {
    background: rgba(200, 0, 0, 1);
  }
`;

const UploadZone = styled.div<{ $isDragging: boolean; $isUploading: boolean }>`
  aspect-ratio: 1;
  border: 2px dashed ${props => props.$isDragging ? '#667eea' : '#ccc'};
  border-radius: 12px;
  background: ${props => props.$isDragging ? '#f0f4ff' : '#fafafa'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.$isUploading ? 'wait' : 'pointer'};
  transition: all 0.3s;

  label {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: ${props => props.$isUploading ? 'wait' : 'pointer'};
    padding: 12px;
    text-align: center;

    svg {
      color: ${props => props.$isDragging ? '#667eea' : '#999'};
      margin-bottom: 8px;
    }
  }

  &:hover {
    border-color: #667eea;
    background: #f0f4ff;

    svg {
      color: #667eea;
    }
  }
`;

const UploadText = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 4px;
`;

const UploadHint = styled.div`
  font-size: 10px;
  color: #999;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PointsHint = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 8px;
  font-size: 13px;
  color: #555;
  border-left: 3px solid #667eea;

  strong {
    color: #667eea;
  }
`;

const PointsBreakdown = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  line-height: 1.6;
`;
