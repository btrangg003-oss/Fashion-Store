import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiCamera, FiTrash2, FiUpload } from 'react-icons/fi'

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`

const AvatarPreview = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #f0f0f0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const DefaultAvatar = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  font-weight: 700;
`

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  &.primary {
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a67d8;
    }
  }
  
  &.secondary {
    background: #f5f5f5;
    color: #666;
    
    &:hover {
      background: #e0e0e0;
    }
  }
  
  &.danger {
    background: #fee;
    color: #e53e3e;
    
    &:hover {
      background: #fdd;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const HiddenInput = styled.input`
  display: none;
`

const UploadInfo = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.5;
`

interface AvatarUploadProps {
  currentAvatar?: string
  onUploadSuccess: (avatarUrl: string) => void
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentAvatar, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentAvatar || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        onUploadSuccess(data.avatarUrl)
      } else {
        alert(data.message || 'Upload thất bại')
        setPreview(currentAvatar || null)
      }
    } catch (error) {
      alert('Không thể upload ảnh')
      setPreview(currentAvatar || null)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa ảnh đại diện?')) return

    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setPreview(null)
        onUploadSuccess('')
      } else {
        alert('Xóa ảnh thất bại')
      }
    } catch (error) {
      alert('Không thể xóa ảnh')
    }
  }

  return (
    <Container>
      <AvatarPreview>
        {preview ? (
          <img src={preview} alt="Avatar" />
        ) : (
          <DefaultAvatar>?</DefaultAvatar>
        )}
      </AvatarPreview>

      <div>
        <ButtonGroup>
          <Button
            className="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {uploading ? (
              <>
                <FiUpload /> Đang tải lên...
              </>
            ) : (
              <>
                <FiCamera /> {preview ? 'Đổi ảnh' : 'Tải ảnh lên'}
              </>
            )}
          </Button>

          {preview && (
            <Button
              className="danger"
              onClick={handleDelete}
              disabled={uploading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiTrash2 /> Xóa ảnh
            </Button>
          )}
        </ButtonGroup>

        <UploadInfo>
          Định dạng: JPG, PNG, GIF<br />
          Kích thước tối đa: 5MB
        </UploadInfo>
      </div>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
      />
    </Container>
  )
}

export default AvatarUpload
