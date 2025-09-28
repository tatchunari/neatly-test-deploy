import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Get specific context by ID
      if (id) {
        const { data: context, error } = await supabase
          .from('chatbot_contexts')
          .select('*')
          .eq('id', id as string)
          .single();

        if (error) {
          console.error('Error fetching context:', error);
          return res.status(404).json({ error: 'Context not found' });
        }

        return res.status(200).json({ context });
      }

      // Get all contexts
      const { data: contexts, error } = await supabase
        .from('chatbot_contexts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contexts:', error);
        throw error;
      }

      res.status(200).json({ contexts: contexts || [] });

    } catch (error) {
      console.error('Error in context GET:', error);
      res.status(500).json({ 
        error: 'Failed to fetch contexts',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'POST') {
    try {
      // Create new context entry
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }

      console.log('Creating context entry:', { content });

      // Use RPC function to insert context
      const { data: contextEntry, error } = await supabase.rpc('insert_context', {
        p_content: content
      });

      if (error) {
        console.error('Error creating context entry:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('Context entry created:', contextEntry);

      // RPC function returns an array, get the first item
      const createdContext = Array.isArray(contextEntry) ? contextEntry[0] : contextEntry;
      
      if (!createdContext || !createdContext.id) {
        console.error('RPC function did not return valid context with ID');
        throw new Error('RPC function did not return valid context with ID');
      }

      res.status(201).json({ 
        context: createdContext,
        success: true 
      });

    } catch (error) {
      console.error('Error in context POST:', error);
      res.status(500).json({ 
        error: 'Failed to create context entry',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'PUT') {
    try {
      // Update context entry
      if (!id) {
        return res.status(400).json({ error: 'Context ID is required for update' });
      }

      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }

      console.log('Updating context entry:', { id, content });

      const { data: updatedContext, error } = await supabase
        .from('chatbot_contexts')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', id as string)
        .select()
        .single();

      if (error) {
        console.error('Error updating context:', error);
        throw error;
      }

      res.status(200).json({ 
        context: updatedContext,
        success: true 
      });

    } catch (error) {
      console.error('Error in context PUT:', error);
      res.status(500).json({ 
        error: 'Failed to update context',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      if (!id) {
        return res.status(400).json({ error: 'Context ID is required for deletion' });
      }

      const { error } = await supabase
        .from('chatbot_contexts')
        .delete()
        .eq('id', id as string);

      if (error) {
        console.error('Error deleting context:', error);
        throw error;
      }

      res.status(200).json({ 
        success: true,
        message: 'Context deleted successfully'
      });

    } catch (error) {
      console.error('Error in context DELETE:', error);
      res.status(500).json({ 
        error: 'Failed to delete context',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
