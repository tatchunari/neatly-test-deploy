import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting guest session cleanup...')
    
    // Calculate timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
    
    // Find guest sessions older than 24 hours
    const { data: oldGuestSessions, error: findError } = await supabaseClient
      .from('chatbot_sessions')
      .select('id, anonymous_id, created_at')
      .is('customer_id', null) // Only guest sessions
      .not('anonymous_id', 'is', null) // Has anonymous_id
      .lt('created_at', twentyFourHoursAgo.toISOString())

    if (findError) {
      console.error('Error finding old guest sessions:', findError)
      throw findError
    }

    if (!oldGuestSessions || oldGuestSessions.length === 0) {
      console.log('No old guest sessions found to cleanup')
      return new Response(
        JSON.stringify({ 
          message: 'No old guest sessions found',
          cleanedSessions: 0,
          cleanedMessages: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log(`Found ${oldGuestSessions.length} old guest sessions to cleanup`)

    // Get session IDs for deletion
    const sessionIds = oldGuestSessions.map(session => session.id)

    // First, delete all messages from these sessions
    const { error: messagesDeleteError } = await supabaseClient
      .from('chatbot_messages')
      .delete()
      .in('session_id', sessionIds)

    if (messagesDeleteError) {
      console.error('Error deleting old guest messages:', messagesDeleteError)
      throw messagesDeleteError
    }

    // Then, delete the sessions themselves
    const { error: sessionsDeleteError } = await supabaseClient
      .from('chatbot_sessions')
      .delete()
      .in('id', sessionIds)

    if (sessionsDeleteError) {
      console.error('Error deleting old guest sessions:', sessionsDeleteError)
      throw sessionsDeleteError
    }

    console.log(`Successfully cleaned up ${oldGuestSessions.length} guest sessions and their messages`)

    return new Response(
      JSON.stringify({ 
        message: 'Guest session cleanup completed successfully',
        cleanedSessions: oldGuestSessions.length,
        cleanedMessages: 'All messages from cleaned sessions',
        sessions: oldGuestSessions.map(s => ({
          id: s.id,
          anonymous_id: s.anonymous_id,
          created_at: s.created_at
        }))
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in guest session cleanup:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to cleanup guest sessions', 
        details: error,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
