import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { provinceCode } = req.query

  if (!provinceCode) {
    return res.status(400).json({ message: 'Province code is required' })
  }

  try {
    const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
    const data = await response.json()

    // Transform to our format
    const districts = data.districts.map((d: any) => ({
      code: d.code.toString(),
      name: d.name,
      provinceCode: provinceCode.toString()
    }))

    res.status(200).json({ districts })
  } catch (error) {
    console.error('Fetch districts error:', error)
    res.status(500).json({ message: 'Failed to fetch districts' })
  }
}
