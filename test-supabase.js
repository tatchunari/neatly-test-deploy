import { createClient } from '@supabase/supabase-js'

// อ่านค่าจาก env
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function main() {
  const { data, error } = await supabase.from('rooms').select('*')
  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('✅ Rooms:', data)
  }
}

main()