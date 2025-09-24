import type { NextApiRequest, NextApiResponse } from 'next';
import { chatWithGemini } from '@/lib/chat';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { userQuestion } = req.body;

    if (!userQuestion) {
      return res.status(400).json({ error: 'User question is required' });
    }

    console.log('🎯 INTENT CLASSIFICATION for:', userQuestion);

    const intentPrompt = `You are an intent classification assistant.
Categories: faq, rooms, promo_codes, other.
Answer only with the category name.
User question: "${userQuestion}"`;

    const intentResponse = await chatWithGemini(intentPrompt);
    const intent = intentResponse.trim().toLowerCase();

    // Validate intent
    const validIntents = ['faq', 'rooms', 'promo_codes', 'other'];
    const classifiedIntent = validIntents.includes(intent) ? intent : 'other';

    console.log('🎯 CLASSIFIED INTENT:', classifiedIntent);

    res.status(200).json({ 
      intent: classifiedIntent,
      originalResponse: intentResponse
    });

  } catch (error) {
    console.error('Error in intent classification:', error);
    res.status(500).json({ 
      error: 'Failed to classify intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
