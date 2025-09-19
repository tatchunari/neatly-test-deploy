import type { NextApiRequest, NextApiResponse } from 'next';

// Mock data for testing
const mockSessions: any[] = [];
const mockMessages: any[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sessionId } = req.query;

  if (req.method === 'POST' && !sessionId) {
    // Create session
    const newSession = {
      id: `session_${Date.now()}`,
      status: 'active',
      anonymous_id: `user_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    
    mockSessions.push(newSession);
    res.status(201).json({ session: newSession });
    
  } else if (req.method === 'GET' && sessionId) {
    // Get messages
    const messages = mockMessages.filter(m => m.session_id === sessionId);
    res.status(200).json({ messages });
    
  } else if (req.method === 'POST' && sessionId) {
    // Send message
    const { message, isBot, senderId } = req.body;
    
    const userMessage = {
      id: `msg_${Date.now()}`,
      session_id: sessionId,
      sender_id: senderId,
      message,
      is_bot: false,
      created_at: new Date().toISOString()
    };
    
    mockMessages.push(userMessage);
    
    // Return only user message (no bot response)
    res.status(201).json({ message: userMessage });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
