import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { districtCode } = req.query

  if (!districtCode) {
    return res.status(400).json({ message: 'District code is required' })
  }

  try {
    const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
    const data = await response.json()

    // Transform to our format
    const wards = data.wards.map((w: any) => ({
      code: w.code.toString(),
      name: w.name,
      districtCode: districtCode.toString()
    }))

    res.status(200).json({ wards })
  } catch (error) {
    console.error('Fetch wards error:', error)
    res.status(500).json({ message: 'Failed to fetch wards' })
  }
}
