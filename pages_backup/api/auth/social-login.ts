import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { createUser, findUserByEmail, updateUser } from '../../../lib/database'
import { generateToken, hashPassword } from '../../../lib/auth'

type Provider = 'google' | 'facebook'

interface SocialLoginRequestBody {
  provider: Provider
  idToken?: string // for Google
  accessToken?: string // for Facebook
}

const fetchGoogleProfile = async (idToken: string): Promise<{ email: string; name?: string } | null> => {
  try {
    const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`)
    if (!resp.ok) return null
    const data = await resp.json()
    const email: string | undefined = data.email
    const name: string | undefined = data.name
    if (!email) return null
    return { email, name }
  } catch {
    return null
  }
}

const fetchFacebookProfile = async (accessToken: string): Promise<{ email: string; name?: string } | null> => {
  try {
    const resp = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`)
    if (!resp.ok) return null
    const data = await resp.json()
    const email: string | undefined = data.email
    const name: string | undefined = data.name
    if (!email) return null
    return { email, name }
  } catch {
    return null
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { provider, idToken, accessToken }: SocialLoginRequestBody = req.body

    if (!provider || (provider === 'google' && !idToken) || (provider === 'facebook' && !accessToken)) {
      return res.status(400).json({ success: false, message: 'Missing provider token' })
    }

    let profile: { email: string; name?: string } | null = null

    if (provider === 'google' && idToken) {
      profile = await fetchGoogleProfile(idToken)
    } else if (provider === 'facebook' && accessToken) {
      profile = await fetchFacebookProfile(accessToken)
    }

    if (!profile) {
      return res.status(401).json({ success: false, message: 'Invalid social token' })
    }

    const email = profile.email.toLowerCase()
    const nameParts = (profile.name || '').trim().split(' ')
    const firstName = nameParts.length ? nameParts[0] : 'User'
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

    let user = await findUserByEmail(email)
    if (!user) {
      const passwordHash = await hashPassword(`social_${provider}_${Date.now()}`)
      user = await createUser({
        id: crypto.randomUUID(),
        email,
        firstName,
        lastName,
        phone: '',
        passwordHash,
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      })
    } else {
      await updateUser(user.id, { lastLoginAt: new Date().toISOString(), isVerified: true })
    }

    const token = generateToken(user)

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/'
    }

    res.setHeader('Set-Cookie', [
      `auth-token=${token}; HttpOnly; Secure=${cookieOptions.secure}; SameSite=${cookieOptions.sameSite}; Max-Age=${cookieOptions.maxAge}; Path=${cookieOptions.path}`
    ])

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập mạng xã hội thành công',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          isVerified: true,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        },
        token,
        provider
      }
    })

  } catch (error) {
    console.error('Social login error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}


