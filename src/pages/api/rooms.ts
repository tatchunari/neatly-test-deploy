import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from '@supabase/supabase-js';

// อ่านค่าจาก env
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Data = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // รองรับเฉพาะ GET method
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Use GET method."
    });
  }

  

  try {
    const { data, error } = await supabase.from('rooms').select('*');
    
    if (error) {
      console.error('❌ Error:', error.message);
      return res.status(400).json({
        success: false,
        message: "Failed to fetch rooms",
        error: error.message
      });
    }

    console.log('✅ Rooms:', data);
    res.status(200).json({
      success: true,
      message: "Rooms fetched successfully",
      data: data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}