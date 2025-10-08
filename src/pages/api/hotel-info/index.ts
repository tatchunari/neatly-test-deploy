import { NextApiRequest, NextApiResponse } from 'next';

// Mock data storage (ใน production ควรใช้ database)
let hotelInfo = {
  name: "Neatly Hotel",
  description: `Set in Bangkok, Thailand, Neatly Hotel offers 5-star accommodation with an outdoor pool, kids' club, sports facilities and a fitness centre. There is also a spa, an indoor pool and saunas.

All units at the hotel are equipped with a seating area, a flat-screen TV with satellite channels, a dining area and a private bathroom with free toiletries, a bathtub and a hairdryer. Every room in Neatly Hotel features a furnished balcony. Some rooms are equipped with a coffee machine.

Free WiFi and entertainment facilities are available at property and also rentals are provided to explore the area.`,
  logoUrl: "/logo.png"
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // ดึงข้อมูลโรงแรม
    res.status(200).json({
      success: true,
      data: hotelInfo
    });
  } else if (req.method === 'PUT') {
    // อัปเดตข้อมูลโรงแรม
    const { name, description, logoUrl } = req.body;
    
    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Hotel name and description are required'
      });
    }

    // Update hotel info
    hotelInfo = {
      name: name.trim(),
      description: description.trim(),
      logoUrl: logoUrl || hotelInfo.logoUrl
    };

    res.status(200).json({
      success: true,
      message: 'Hotel information updated successfully',
      data: hotelInfo
    });
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });
  }
}
