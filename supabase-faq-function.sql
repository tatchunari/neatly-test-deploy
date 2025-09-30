-- Create function to insert FAQ with embedding
CREATE OR REPLACE FUNCTION insert_faq_with_embedding(
  p_question text,
  p_answer text,
  p_embedding text
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
  
  -- Insert with embedding
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
