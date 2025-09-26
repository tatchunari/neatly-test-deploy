import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { anonymousId } = req.body;
    
    if (!anonymousId) {
      return res.status(400).json({ error: 'Anonymous ID is required' });
    }

    // Get the current user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('Linking guest session to user:', { anonymousId, userId: user.id });

    // Find all sessions with this anonymous_id
    const { data: guestSessions, error: findError } = await supabase
      .from('chatbot_sessions')
      .select('*')
      .eq('anonymous_id', anonymousId)
      .is('customer_id', null);

    if (findError) {
      console.error('Error finding guest sessions:', findError);
      throw findError;
    }

    if (!guestSessions || guestSessions.length === 0) {
      console.log('No guest sessions found for anonymous ID:', anonymousId);
      return res.status(200).json({ 
        message: 'No guest sessions to link',
        linkedSessions: 0 
      });
    }

    // Update all guest sessions to link with the user
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
      console.error('Error updating sessions:', updateError);
      throw updateError;
    }

    console.log('Successfully linked sessions:', updatedSessions?.length || 0);

    res.status(200).json({ 
      message: 'Guest sessions linked successfully',
      linkedSessions: updatedSessions?.length || 0,
      sessions: updatedSessions
    });

  } catch (error) {
    console.error('Error linking guest session:', error);
    res.status(500).json({ 
      error: 'Failed to link guest session', 
      details: error,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
