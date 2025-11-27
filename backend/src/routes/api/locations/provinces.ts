import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const response = await fetch('https://provinces.open-api.vn/api/p/')
    const data = await response.json()

    // Transform to our format
    const provinces = data.map((p: any) => ({
      code: p.code.toString(),
      name: p.name
    }))

    res.status(200).json({ provinces })
  } catch (error) {
    console.error('Fetch provinces error:', error)
    res.status(500).json({ message: 'Failed to fetch provinces' })
  }
}
