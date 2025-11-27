import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../../lib/auth'
import { getReturnById, updateReturn } from '../../../../lib/returnService'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    const { id } = req.query

    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid return ID' })
    }

    // Check return exists and belongs to user
    const returnRequest = await getReturnById(id)
    if (!returnRequest) {
      return res.status(404).json({ message: 'Yêu cầu trả hàng không tồn tại' })
    }

    if (returnRequest.userId !== decoded.userId) {
      return res.status(403).json({ message: 'Không có quyền truy cập' })
    }

    // Parse form data
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'returns')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      uploadDir,
      keepExtensions: true,
      filename: (_name: string, ext: string) => {
        return `${id}_${Date.now()}${ext}`
      }
    })

    const [_fields, files] = await form.parse(req)
    const uploadedFiles = Array.isArray(files.photos) ? files.photos : files.photos ? [files.photos] : []

    if (uploadedFiles.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' })
    }

    // Validate file types
    const photoUrls: string[] = []
    for (const file of uploadedFiles) {
      if (!file.mimetype?.startsWith('image/')) {
        fs.unlinkSync(file.filepath)
        continue
      }
      photoUrls.push(`/uploads/returns/${path.basename(file.filepath)}`)
    }

    if (photoUrls.length === 0) {
      return res.status(400).json({ message: 'No valid image files' })
    }

    // Update return with new photos
    const existingPhotos = returnRequest.photos || []
    const allPhotos = [...existingPhotos, ...photoUrls].slice(0, 5) // Max 5 photos

    await updateReturn(id, { photos: allPhotos })

    res.status(200).json({
      success: true,
      message: 'Upload ảnh thành công',
      photoUrls
    })
  } catch (error: any) {
    console.error('Upload photos error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}
