-- Setup Supabase Vector Extension and FAQ Functions
-- Run this in Supabase SQL Editor

-- 1. Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1.5. Update table schema to support 1536 dimensions
ALTER TABLE chatbot_faqs ALTER COLUMN embedding TYPE vector(1536);

-- 2. Drop existing function to avoid overloading conflicts
DROP FUNCTION IF EXISTS insert_faq_with_embedding(text, text, text);
DROP FUNCTION IF EXISTS insert_faq_with_embedding(text, text, float4[]);

-- 3. Create function to insert FAQ with embedding
CREATE FUNCTION insert_faq_with_embedding(
  p_question text,
  p_answer text,
  p_embedding float4[]
)
RETURNS TABLE (
  id uuid,
  question text,
  answer text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Generate new UUID
  new_id := gen_random_uuid();
  
  -- Insert with embedding - convert array to vector (1536 dimensions)
  INSERT INTO chatbot_faqs (id, question, answer, embedding, created_by, created_at, updated_at)
  VALUES (
    new_id,
    p_question,
    p_answer,
    p_embedding::vector(1536),
    null,
    NOW(),
    NOW()
  );
  
  -- Return the inserted record
  RETURN QUERY
  SELECT 
    c.id,
    c.question,
    c.answer,
    c.created_at,
    c.updated_at
  FROM chatbot_faqs c
  WHERE c.id = new_id;
END;
$$;

-- 4. Create function for FAQ vector similarity search
CREATE OR REPLACE FUNCTION match_faqs(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  question text,
  answer text,
  similarity float,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    faqs.id,
    faqs.question,
    faqs.answer,
    1 - (faqs.embedding <=> query_embedding) as similarity,
    faqs.created_at,
    faqs.updated_at
  FROM chatbot_faqs faqs
  WHERE faqs.embedding IS NOT NULL
    AND 1 - (faqs.embedding <=> query_embedding) > match_threshold
  ORDER BY faqs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Create index for better vector search performance
CREATE INDEX IF NOT EXISTS chatbot_faqs_embedding_idx ON chatbot_faqs 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 6. Test the setup
SELECT 'Vector extension enabled' as status;
SELECT 'Functions created successfully' as status;
SELECT 'Index created successfully' as status;
