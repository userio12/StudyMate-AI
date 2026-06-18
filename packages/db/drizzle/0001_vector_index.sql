-- pgvector HNSW index for efficient approximate nearest neighbor search on chunk embeddings
-- Requires pgvector extension to be installed: CREATE EXTENSION IF NOT EXISTS vector;
-- Cosine distance is used since text-embedding-004 embeddings are normalized

CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON chunks
  USING hnsw (embedding vector_cosine_ops);
