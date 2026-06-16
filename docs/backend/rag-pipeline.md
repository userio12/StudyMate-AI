# RAG Pipeline

The Retrieval-Augmented Generation (RAG) pipeline is the core of StudyMate AI. It transforms PDF course materials into a searchable knowledge base and enables citation-grounded chat.

## Pipeline Overview

```
PDF Upload ──► Text Extraction ──► Semantic Chunking ──► Embedding ──► Vector Store
                                                                           │
User Query ──► Embedding ──► Vector Search ──► Context Assembly ──► LLM ──► Response + Citations
```

## Phase 1: Ingestion (Offline)

### Step 1: Text Extraction

```typescript
// ai/pdf-processor.service.ts
async extractText(pdfBuffer: Buffer): Promise<ExtractedPage[]> {
  const pdf = await pdfParse(pdfBuffer);
  
  return pdf.pages.map((page, index) => ({
    pageNumber: index + 1,
    text: page.text,
    // Clean headers/footers
    text: this.removeRepeatingElements(page.text),
  }));
}
```

**Strategy:**
- Use `pdf-parse` for text extraction (works well for digital PDFs)
- For scanned PDFs, future: integrate Google Document AI or Tesseract
- Clean repeated headers, footers, and page numbers

### Step 2: Semantic Chunking

Chunk boundaries are determined by document structure, not arbitrary token counts:

```typescript
function semanticChunk(pages: ExtractedPage[]): Chunk[] {
  const chunks: Chunk[] = [];
  let currentChunk = '';
  let currentHeading = '';
  let currentPageStart = 0;

  for (const page of pages) {
    const lines = page.text.split('\n');
    
    for (const line of lines) {
      if (isHeading(line)) {
        // Save previous chunk if it has content
        if (currentChunk.length > 100) {
          chunks.push({
            content: currentChunk,
            heading: currentHeading,
            pageRange: [currentPageStart, page.pageNumber],
          });
        }
        // Start new chunk
        currentHeading = line;
        currentChunk = line + '\n';
        currentPageStart = page.pageNumber;
      } else {
        currentChunk += line + '\n';
      }
    }
  }
  
  return chunks;
}
```

**Chunking rules (in priority order):**
1. **Heading boundaries** (`#`, `##`, `###`, bold headings) — preferred split point
2. **Paragraph breaks** (double newline) — minimum 100 characters
3. **Sentence boundaries** (`.`, `!`, `?`) — minimum 200 characters
4. **Token limit** (512 tokens) — hard cap with 10% overlap to previous chunk

**Why this approach?**
- Preserves semantic coherence (each chunk = one subtopic)
- Headings in metadata enable better context assembly
- Overlap prevents information loss at boundaries

### Step 3: Embedding

```typescript
// ai/embeddings.service.ts
@Injectable()
export class EmbeddingsService {
  private model: GenerativeModel;

  constructor() {
    this.model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      .getGenerativeModel({ model: 'text-embedding-004' });
  }

  async embed(text: string): Promise<number[]> {
    const result = await this.model.embedContent(text);
    return result.embedding.values;  // 768-dimensional vector
  }
}
```

**Batch processing:**
```typescript
async embedBatch(chunks: string[]): Promise<number[][]> {
  // Gemini supports batched embedding
  const results = await Promise.all(
    chunks.map(chunk => this.embed(chunk))
  );
  return results;
}
```

### Step 4: Vector Store Insertion

```typescript
async storeChunks(documentId: string, chunks: ProcessedChunk[]) {
  const values = chunks.map(chunk => ({
    documentId,
    content: chunk.content,
    embedding: chunk.embedding,
    pageNumber: chunk.pageRange[0],
    chunkIndex: chunk.index,
    metadata: {
      heading: chunk.heading,
      tokenCount: chunk.tokenCount,
      pageRange: chunk.pageRange,
    },
  }));

  await this.db.insert(chunks).values(values);
}
```

## Phase 2: Query (Online)

### Step 1: Query Embedding

Same embedding function as ingestion — ensures vectors are in the same space.

### Step 2: Vector Search

```typescript
// chat/chat.service.ts
async retrieveContext(
  queryEmbedding: number[],
  documentIds: string[],
): Promise<Chunk[]> {
  const vectorResults = await this.db.execute(sql`
    SELECT id, content, page_number, metadata,
      1 - (embedding <=> ${queryEmbedding}::vector) AS similarity
    FROM chunks
    WHERE document_id = ANY(${documentIds}::uuid[])
    ORDER BY embedding <=> ${queryEmbedding}::vector
    LIMIT 20
  `);

  const keywordResults = await this.db.execute(sql`
    SELECT id, content, page_number, metadata,
      ts_rank(to_tsvector('english', content),
              plainto_tsquery('english', ${queryText})) AS rank
    FROM chunks
    WHERE document_id = ANY(${documentIds}::uuid[])
      AND to_tsvector('english', content) @@ plainto_tsquery('english', ${queryText})
    ORDER BY rank DESC
    LIMIT 20
  `);

  // RRF fusion
  return fuserrf(vectorResults, keywordResults, 5);
}
```

**Hybrid search (RRF Fusion):**
Combines vector similarity and keyword matching to capture both semantic meaning and exact term matches (proper nouns, equations, code).

### Step 3: Context Assembly

```typescript
function buildPrompt(query: string, chunks: Chunk[]): string {
  const context = chunks
    .map((c, i) =>
      `[citation:${i}] (Page ${c.pageNumber}) [${c.metadata?.heading || 'General'}]\n${c.content}`
    )
    .join('\n\n');

  return `
You are a helpful tutor. Answer the student's question based ONLY on the provided course material.
If the material doesn't contain the answer, say "I couldn't find this in your course material."

Cite your sources using [citation:INDEX] markers after relevant sentences.

Context:
${context}

Question: ${query}

Answer (with citations):`;
}
```

### Step 4: Streaming Response

```typescript
async streamResponse(
  prompt: string,
  res: Response,
): Promise<{ citations: Citation[]; fullContent: string }> {
  const genModel = new GoogleGenerativeAI(API_KEY)
    .getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await genModel.generateContentStream(prompt);

  let fullContent = '';
  const citations: Citation[] = [];

  for await (const chunk of result.stream) {
    const text = chunk.text();
    fullContent += text;

    // Stream token to client
    res.write(`data: ${JSON.stringify({ type: 'token', data: text })}\n\n`);

    // Parse citations from accumulated content
    const newCitations = extractCitations(fullContent);
    for (const citation of newCitations) {
      if (!citations.find(c => c.index === citation.index)) {
        citations.push(citation);
        res.write(`data: ${JSON.stringify({ type: 'citation', data: citation })}\n\n`);
      }
    }
  }

  return { citations, fullContent };
}
```

### Step 5: Citation Extraction

```typescript
function extractCitations(content: string): Citation[] {
  const regex = /\[citation:(\d+)\]/g;
  const citations: Citation[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    const index = parseInt(match[1]);
    // Map to actual chunk data (stored from context)
    citations.push({
      index,
      pageNumber: contextChunks[index].pageNumber,
      excerpt: contextChunks[index].content.slice(0, 150),
    });
  }

  return citations;
}
```

## Processing Queue

PDF processing runs asynchronously to avoid blocking the API:

```typescript
// documents/documents.service.ts
async processDocument(documentId: string) {
  // Update status
  await this.db.update(documents)
    .set({ status: 'processing' })
    .where(eq(documents.id, documentId));

  try {
    // 1. Download from S3
    const pdfBuffer = await this.storage.download(document.s3Key);

    // 2. Extract text
    const pages = await this.pdfProcessor.extractText(pdfBuffer);

    // 3. Semantic chunking
    const chunks = semanticsemanticChunk(pages);

    // 4. Generate embeddings (batched)
    const embeddings = await this.embeddingsService.embedBatch(
      chunks.map(c => c.content)
    );

    // 5. Store chunks with embeddings
    const enrichedChunks = chunks.map((c, i) => ({
      ...c,
      embedding: embeddings[i],
    }));
    await this.chunksService.storeChunks(documentId, enrichedChunks);

    // 6. Update document status
    await this.db.update(documents)
      .set({ status: 'ready', pageCount: pages.length })
      .where(eq(documents.id, documentId));

  } catch (error) {
    // 7. Handle failure
    await this.db.update(documents)
      .set({ status: 'error', errorMessage: error.message })
      .where(eq(documents.id, documentId));

    throw error;
  }
}
```

**Status transitions:**

```
uploaded ──► processing ──► ready
                 │
                 └──► error
```

## Performance Considerations

| Operation | Expected Time | Optimization |
|---|---|---|
| PDF upload (10MB) | ~2s | Direct-to-S3 presigned URL |
| Text extraction (100 pages) | ~3s | pdf-parse sync |
| Semantic chunking (100 pages) | <100ms | Stream-based processing |
| Embedding (200 chunks) | ~5s | Gemini batch API |
| Vector search (100K chunks) | <50ms | IVFFlat index, 100 lists |
| LLM streaming (500 tokens) | ~3s first token | Gemini 2.0 Flash |
| Full pipeline (100 pages) | ~10s | Runs asynchronously |

## Error Handling

| Error | Cause | Mitigation |
|---|---|---|
| Empty PDF | PDF has no extractable text | Return `error` status with message |
| Corrupted PDF | Invalid file format | Validate PDF magic bytes on upload |
| Embedding timeout | Gemini API unavailable | Retry with exponential backoff (3 attempts) |
| Vector search failure | pgvector index not created | Log warning, fallback to keyword-only search |
| Token limit exceeded | Document >500 pages | Reject upload with clear error message |
