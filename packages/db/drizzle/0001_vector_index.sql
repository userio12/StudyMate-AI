-- pgvector IVFFlat index for approximate nearest neighbor search on chunk embeddings
-- Requires pgvector extension to be installed: CREATE EXTENSION IF NOT EXISTS vector;
-- Cosine distance is used since text-embedding-004 embeddings are normalized

CREATE INDEX IF NOT EXISTS idx_chunks_embedding_ivfflat
  ON chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
