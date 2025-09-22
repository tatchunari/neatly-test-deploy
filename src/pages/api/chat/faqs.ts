import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // GET /api/chat/faq?id=xxx (Get specific FAQ)
      // GET /api/chat/faq (Get all FAQs)

      // Get specific FAQ by ID
      if (id) {
        const { data: faq, error } = await supabase
          .from('chatbot_faqs')
          .select('*')
          .eq('id', id as string)
          .single();

        if (error) {
          console.error('Error fetching FAQ:', error);
          return res.status(404).json({ error: 'FAQ not found' });
        }

        return res.status(200).json({ faq });
      }

      // Get all FAQs
      const { data: faqs, error } = await supabase
        .from('chatbot_faqs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching FAQs:', error);
        throw error;
      }

      res.status(200).json({ faqs: faqs || [] });

    } catch (error) {
      console.error('Error in FAQ GET:', error);
      res.status(500).json({ 
        error: 'Failed to fetch FAQs',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'POST') {
    try {
      // Create new FAQ entry
      const { question, answer, embedding } = req.body;

      if (!question || !answer) {
        return res.status(400).json({ error: 'Question and answer are required' });
      }

      console.log('Creating FAQ entry:', { 
        question, 
        answer, 
        hasEmbedding: !!embedding,
        embeddingLength: embedding?.length || 0
      });

      let faqEntry, error;

      if (embedding && Array.isArray(embedding)) {
        // Use RPC function for embedding - send as array directly
        console.log('Using RPC function with embedding array length:', embedding.length);
        console.log('First 5 values:', embedding.slice(0, 5));
        
        const { data, error: rpcError } = await supabase.rpc('insert_faq_with_embedding', {
          p_question: question,
          p_answer: answer,
          p_embedding: embedding // ส่ง array โดยตรง ไม่ต้องแปลงเป็น string
        });
        
        faqEntry = data;
        error = rpcError;
      } else {
        // Use normal insert without embedding
        const { data, error: insertError } = await supabase
          .from('chatbot_faqs')
          .insert({
            question,
            answer,
            embedding: null,
            created_by: null
          })
          .select()
          .single();
        
        faqEntry = data;
        error = insertError;
      }

      if (error) {
        console.error('Error creating FAQ entry:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('FAQ entry created:', faqEntry);

      res.status(201).json({ 
        faq: faqEntry,
        success: true 
      });

    } catch (error) {
      console.error('Error in FAQ POST:', error);
      res.status(500).json({ 
        error: 'Failed to create FAQ entry',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'PUT') {
    try {
      // Update FAQ entry
      if (!id) {
        return res.status(400).json({ error: 'FAQ ID is required for update' });
      }

      const { question, answer, embedding } = req.body;

      if (!question || !answer) {
        return res.status(400).json({ error: 'Question and answer are required' });
      }

      console.log('Updating FAQ entry:', { id, question, answer });

      // Convert embedding array to vector string format
      let embeddingString = null;
      if (embedding && Array.isArray(embedding)) {
        embeddingString = `[${embedding.join(',')}]::vector(1536)`;
        console.log('Embedding string format for update:', embeddingString.substring(0, 50) + '...');
      }

      const { data: updatedFaq, error } = await supabase
        .from('chatbot_faqs')
        .update({
          question,
          answer,
          embedding: embeddingString,
          updated_at: new Date().toISOString()
        })
        .eq('id', id as string)
        .select()
        .single();

      if (error) {
        console.error('Error updating FAQ:', error);
        throw error;
      }

      console.log('FAQ entry updated:', updatedFaq);

      res.status(200).json({ 
        faq: updatedFaq,
        success: true 
      });

    } catch (error) {
      console.error('Error updating FAQ:', error);
      res.status(500).json({ 
        error: 'Failed to update FAQ entry',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Delete FAQ entry
      if (!id) {
        return res.status(400).json({ error: 'FAQ ID is required for deletion' });
      }

      console.log('Deleting FAQ entry:', id);

      const { error } = await supabase
        .from('chatbot_faqs')
        .delete()
        .eq('id', id as string);

      if (error) {
        console.error('Error deleting FAQ:', error);
        throw error;
      }

      console.log('FAQ entry deleted:', id);

      res.status(200).json({ 
        message: 'FAQ entry deleted successfully',
        success: true 
      });

    } catch (error) {
      console.error('Error deleting FAQ:', error);
      res.status(500).json({ 
        error: 'Failed to delete FAQ entry',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
