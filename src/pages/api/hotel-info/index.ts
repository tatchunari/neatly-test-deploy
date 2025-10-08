import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// สร้าง supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // ดึงข้อมูลโรงแรมจาก supabase (table: hotel_information)
    const { data, error } = await supabase
      .from('hotel_information')
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch hotel information',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } else if (req.method === 'PUT') {
    // อัปเดตข้อมูลโรงแรมใน supabase (table: hotel_information)
    const { name, description, logo_url } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Hotel name and description are required',
      });
    }

    // ดึงข้อมูลโรงแรมปัจจุบัน (assume มีแค่ 1 record)
    const { data: currentData, error: fetchError } = await supabase
      .from('hotel_information')
      .select('*')
      .single();

    if (fetchError || !currentData) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch current hotel information',
        error: fetchError ? fetchError.message : 'No hotel information found',
      });
    }

    // อัปเดตข้อมูล (update by id)
    const { data: updatedData, error: updateError } = await supabase
      .from('hotel_information')
      .update({
        name: name.trim(),
        description: description.trim(),
        logo_url: logo_url ?? currentData.logo_url,
      })
      .eq('id', currentData.id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update hotel information',
        error: updateError.message,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hotel information updated successfully',
      data: updatedData,
    });
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });
  }
}
