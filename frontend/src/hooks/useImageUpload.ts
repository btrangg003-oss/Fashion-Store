import { useState, useCallback } from 'react';

interface UseImageUploadReturn {
  images: string[];
  uploading: boolean;
  error: string | null;
  addImages: (files: FileList | File[]) => Promise<void>;
  removeImage: (index: number) => void;
  clearImages: () => void;
  setImages: (images: string[]) => void;
}

export const useImageUpload = (
  initialImages: string[] = [],
  maxImages: number = 5,
  maxSizeMB: number = 5
): UseImageUploadReturn => {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/reviews/upload-image', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const addImages = useCallback(async (files: FileList | File[]) => {
    setError(null);
    
    const fileArray = Array.from(files);
    
    // Validate count
    if (images.length + fileArray.length > maxImages) {
      setError(`Tối đa ${maxImages} ảnh`);
      return;
    }

    // Validate each file
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        setError('Chỉ chấp nhận file ảnh (JPG, PNG, GIF)');
        return;
      }
      
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Kích thước ảnh tối đa ${maxSizeMB}MB`);
        return;
      }
    }

    // Upload
    setUploading(true);
    try {
      const uploadPromises = fileArray.map(file => uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...urls]);
    } catch (err: any) {
      setError(err.message || 'Lỗi upload ảnh. Vui lòng thử lại.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }, [images.length, maxImages, maxSizeMB]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setError(null);
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
    setError(null);
  }, []);

  return {
    images,
    uploading,
    error,
    addImages,
    removeImage,
    clearImages,
    setImages
  };
};
