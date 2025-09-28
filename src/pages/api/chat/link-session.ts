import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('🔗 Link Session API: Request received', { method: req.method });
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { anonymousId } = req.body;
    console.log('📝 Link Session API: Request body received', { anonymousId });
    
    if (!anonymousId) {
      console.error('❌ Link Session API: No anonymous ID provided');
      return res.status(400).json({ error: 'Anonymous ID is required' });
    }

    // Get the current user from Supabase auth
    // First try to get user from Authorization header
    const authHeader = req.headers.authorization;
    let user = null;
    let authError = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('🔑 Link Session API: Using Bearer token for authentication');
      
      // Set the auth token and get user
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      user = tokenUser;
      authError = tokenError;
    } else {
      // Fallback to default auth method
      console.log('🔑 Link Session API: Using default auth method');
      const { data: { user: defaultUser }, error: defaultError } = await supabase.auth.getUser();
      user = defaultUser;
      authError = defaultError;
    }
    
    if (authError || !user) {
      console.error('❌ Link Session API: User not authenticated', { 
        authError, 
        hasAuthHeader: !!authHeader,
        authHeaderType: authHeader ? authHeader.split(' ')[0] : 'none'
      });
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('🔗 Link Session API: Linking guest session to user:', { 
      anonymousId, 
      userId: user.id, 
      userEmail: user.email 
    });

    // First, check if user already has any sessions
    console.log('🔍 Link Session API: Checking if user already has sessions');
    const { data: existingUserSessions, error: userSessionsError } = await supabase
      .from('chatbot_sessions')
      .select('id, created_at')
      .eq('customer_id', user.id);

    if (userSessionsError) {
      console.error('❌ Link Session API: Error checking user sessions:', userSessionsError);
      throw userSessionsError;
    }

    console.log('📊 Link Session API: User existing sessions:', {
      count: existingUserSessions?.length || 0,
      sessions: existingUserSessions || []
    });

    // If user already has sessions, just clear the anonymous ID and return
    if (existingUserSessions && existingUserSessions.length > 0) {
      console.log('✅ Link Session API: User already has sessions, clearing anonymous ID');
      
      // Clear anonymous ID from localStorage by returning instruction to client
      return res.status(200).json({ 
        message: 'User already has sessions, no linking needed',
        linkedSessions: 0,
        userHasExistingSessions: true,
        existingSessionsCount: existingUserSessions.length
      });
    }

    // Find all sessions with this anonymous_id
    console.log('🔍 Link Session API: Searching for guest sessions with anonymousId:', anonymousId);
    const { data: guestSessions, error: findError } = await supabase
      .from('chatbot_sessions')
      .select('*')
      .eq('anonymous_id', anonymousId)
      .is('customer_id', null);

    if (findError) {
      console.error('❌ Link Session API: Error finding guest sessions:', findError);
      throw findError;
    }

    console.log('📊 Link Session API: Found guest sessions:', {
      count: guestSessions?.length || 0,
      sessions: guestSessions?.map(s => ({ id: s.id, created_at: s.created_at })) || []
    });

    if (!guestSessions || guestSessions.length === 0) {
      console.log('ℹ️ Link Session API: No guest sessions found for anonymous ID:', anonymousId);
      return res.status(200).json({ 
        message: 'No guest sessions to link',
        linkedSessions: 0 
      });
    }

    // Update all guest sessions to link with the user
    console.log('🔄 Link Session API: Updating guest sessions to link with user:', user.id);
    const { data: updatedSessions, error: updateError } = await supabase
      .from('chatbot_sessions')
      .update({ 
        customer_id: user.id,
        anonymous_id: null // Clear anonymous_id after linking
      })
      .eq('anonymous_id', anonymousId)
      .is('customer_id', null)
      .select();

    if (updateError) {
      console.error('❌ Link Session API: Error updating sessions:', updateError);
      throw updateError;
    }

    console.log('✅ Link Session API: Successfully linked sessions:', {
      count: updatedSessions?.length || 0,
      sessions: updatedSessions?.map(s => ({ id: s.id, customer_id: s.customer_id })) || []
    });

    res.status(200).json({ 
      message: 'Guest sessions linked successfully',
      linkedSessions: updatedSessions?.length || 0,
      sessions: updatedSessions
    });

  } catch (error) {
    console.error('❌ Link Session API: Error linking guest session:', error);
    res.status(500).json({ 
      error: 'Failed to link guest session', 
      details: error,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
