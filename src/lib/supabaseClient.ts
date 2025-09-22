import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { 
      persistSession: true, // เก็บ session ค้างไว้ใน localStorage
      autoRefreshToken: true // ต่ออายุ token ให้อัตโนมัติ
    },
  });