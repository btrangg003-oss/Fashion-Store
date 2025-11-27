import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../lib/auth'
import { updateUser } from '../../../lib/userOperations'
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

    // Parse form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      uploadDir: path.join(process.cwd(), 'public', 'uploads', 'avatars'),
      keepExtensions: true,
      filename: (_name: string, ext: string, _part: any) => {
        return `${decoded.userId}_${Date.now()}${ext}`
      }
    })

    // Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const [_fields, files] = await form.parse(req)
    const avatarFile = Array.isArray(files.avatar) ? files.avatar[0] : files.avatar

    if (!avatarFile) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // Validate file type
    if (!avatarFile.mimetype?.startsWith('image/')) {
      fs.unlinkSync(avatarFile.filepath)
      return res.status(400).json({ message: 'File must be an image' })
    }

    // Get relative path
    const avatarUrl = `/uploads/avatars/${path.basename(avatarFile.filepath)}`

    // Update user
    await updateUser(decoded.userId, {
      avatar: avatarUrl,
      updatedAt: new Date().toISOString()
    })

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      avatarUrl
    })
  } catch (error) {
    console.error('Upload avatar error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
