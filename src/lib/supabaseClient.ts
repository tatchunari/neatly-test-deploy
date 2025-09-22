import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

<<<<<<< HEAD
if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

=======
>>>>>>> dd737d9 (feat: create CustomerLoginPage component with integrated LoginForm and responsive layout)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
<<<<<<< HEAD
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
=======
>>>>>>> dd737d9 (feat: create CustomerLoginPage component with integrated LoginForm and responsive layout)
  });