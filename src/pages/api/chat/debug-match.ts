import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { createEmbedding } from '@/lib/embedding';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { text, threshold, topk } = req.query;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing query param: text' });
    }

    const matchThreshold = typeof threshold === 'string' ? parseFloat(threshold) : 0.7;
    const matchCount = typeof topk === 'string' ? parseInt(topk, 10) : 5;

    // Strict match first (FAQ questions)
    const normalize = (s: string) => s.trim().toLowerCase();
    const userQuery = normalize(text);

    const { data: faqsAll } = await supabase
      .from('chatbot_faqs')
      .select('id,question,answer')
      .neq('question', '::greeting::')
      .neq('question', '::fallback::');

    let strict: Array<{ id: string; question: string; answer: string }> = [];
    if (faqsAll) {
      const hit = faqsAll.find(f => normalize(f.question) === userQuery);
      if (hit) strict = [hit];
    }

    // If not found in questions, check aliases via faq_id
    if (strict.length === 0) {
      const { data: aliases } = await supabase
        .from('chatbot_faq_aliases')
        .select('alias, faq_id');

      const matched = (aliases || []).find(a => normalize(a.alias) === userQuery);
      if (matched?.faq_id) {
        const { data: faq } = await supabase
          .from('chatbot_faqs')
          .select('id,question,answer')
          .eq('id', matched.faq_id)
          .single();
        if (faq) strict = [faq];
      }
    }

    const embedding = await createEmbedding(text);

    // Vector match via RPC
    const { data: matches, error: rpcError } = await supabase.rpc('match_faqs_with_aliases', {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });
    if (rpcError) {
      console.error('match_faqs RPC error:', rpcError);
    }

    // Also include fallback for visibility
    const { data: fallback } = await supabase
      .from('chatbot_faqs')
      .select('id,question,answer')
      .eq('question', '::fallback::')
      .limit(1);

    return res.status(200).json({
      input: text,
      threshold: matchThreshold,
      topk: matchCount,
      strictMatch: strict || [],
      vectorMatches: matches || [],
      fallback: fallback?.[0] || null,
    });
  } catch (error) {
    console.error('debug-match error:', error);
    return res.status(500).json({ error: 'Failed to compute similarity', details: (error as Error).message });
  }
}


