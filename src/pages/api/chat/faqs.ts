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
      const { question, answer } = req.body;

      if (!question || !answer) {
        return res.status(400).json({ error: 'Question and answer are required' });
      }

      console.log('Creating FAQ entry:', { question, answer });

      // Check if it's a special message (greeting/fallback) that doesn't need embedding
      const isSpecialMessage = question === '::greeting::' || question === '::fallback::';

      if (isSpecialMessage) {
        // Insert without embedding for special messages
        const { data: faqEntry, error } = await supabase
          .from('chatbot_faqs')
          .insert([{ 
            question, 
            answer,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating special FAQ entry:', error);
          throw error;
        }

        console.log('Special FAQ entry created:', faqEntry);
        res.status(201).json({ 
          faq: faqEntry,
          success: true 
        });
      } else {
        // Create embedding for regular questions
        const { createEmbedding } = await import('@/lib/embedding');
        const embedding = await createEmbedding(question);
        
        console.log('Generated embedding length:', embedding.length);

        // Use RPC function to insert FAQ with embedding
        const { data: faqEntry, error } = await supabase.rpc('insert_faq_with_embedding', {
          p_question: question,
          p_answer: answer,
          p_embedding: embedding
        });

        if (error) {
          console.error('Error creating FAQ entry:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          throw error;
        }

        console.log('FAQ entry created:', faqEntry);

        // RPC function returns an array, get the first item
        const createdFAQ = Array.isArray(faqEntry) ? faqEntry[0] : faqEntry;
        
        if (!createdFAQ || !createdFAQ.id) {
          console.error('RPC function did not return valid FAQ with ID');
          throw new Error('RPC function did not return valid FAQ with ID');
        }

        res.status(201).json({ 
          faq: createdFAQ,
          success: true 
        });
      }

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

      const { question, answer } = req.body;

      if (!question || !answer) {
        return res.status(400).json({ error: 'Question and answer are required' });
      }

      console.log('Updating FAQ entry:', { id, question, answer });

      // Check if it's a special message (greeting/fallback) that doesn't need embedding
      const isSpecialMessage = question === '::greeting::' || question === '::fallback::';

      if (isSpecialMessage) {
        // Update without embedding for special messages
        const { data: updatedFaq, error } = await supabase
          .from('chatbot_faqs')
          .update({ 
            question, 
            answer,
            updated_at: new Date().toISOString()
          })
          .eq('id', id as string)
          .select()
          .single();

        if (error) {
          console.error('Error updating special FAQ:', error);
          throw error;
        }

        console.log('Special FAQ entry updated:', updatedFaq);
        res.status(200).json({ 
          faq: updatedFaq,
          success: true 
        });
      } else {
        // Create embedding for regular questions
        const { createEmbedding } = await import('@/lib/embedding');
        const embedding = await createEmbedding(question);
        
        console.log('Generated embedding length for update:', embedding.length);

        // Use RPC function to update FAQ with embedding
        const { data: updatedFaq, error } = await supabase.rpc('insert_faq_with_embedding', {
          p_question: question,
          p_answer: answer,
          p_embedding: embedding
        });

        if (error) {
          console.error('Error updating FAQ:', error);
          throw error;
        }

        console.log('FAQ entry updated:', updatedFaq);

        // RPC function returns an array, get the first item
        const createdFAQ = Array.isArray(updatedFaq) ? updatedFaq[0] : updatedFaq;
        
        if (!createdFAQ || !createdFAQ.id) {
          console.error('RPC function did not return valid FAQ with ID');
          throw new Error('RPC function did not return valid FAQ with ID');
        }

        res.status(200).json({ 
          faq: createdFAQ,
          success: true 
        });
      }

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
