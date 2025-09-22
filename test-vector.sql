-- Test if vector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Test if we can create a simple vector
SELECT '[1,2,3]'::vector;

-- Test if we can insert into chatbot_faqs with embedding
INSERT INTO chatbot_faqs (question, answer, embedding, created_by) 
VALUES ('test', 'test answer', '[0.1,0.2,0.3]'::vector, null);
