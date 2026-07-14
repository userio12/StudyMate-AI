# RAG & AI Pipeline Audit Findings

## Compliant Features
1. **RAG Hybrid Search (RRF)**: The `RagService` accurately implements Rank Reciprocal Fusion (RRF), combining vector similarity (`<=>` operator) with full-text search (`ts_rank`) exactly as specified in the docs.
2. **Asynchronous Processing**: The `DocumentsService` correctly implements asynchronous PDF processing using BullMQ, setting the document status to `queued` while the worker processes it, mirroring the non-blocking design in the docs.
3. **Direct-to-storage Uploads**: The system correctly implements the presigned URL upload pattern where files are uploaded directly to the storage bucket before processing.

## Deviations
1. **Storage Provider**: The documentation heavily specifies AWS S3 (`@aws-sdk/client-s3`) and IAM policies, but the actual `StorageService` uses Supabase Storage (`@supabase/supabase-js`). 
2. **AI Provider Implementation**: The documentation outlines a direct dependency on `@google/generative-ai` SDK (`GoogleGenerativeAI`). However, the implementation uses the `openai` SDK as a shim to communicate with Gemini, and also includes complex fallback support for OpenRouter and NVIDIA (`AiService.executeWithFallback`).
3. **PDF Text Extraction & OCR**: The documentation states `pdf-parse` is used. The codebase actually uses `@opendataloader/pdf` and dynamically detects image pages to run OCR using Vision models (e.g., Llama-3/Gemini Vision). The docs listed OCR as a "future" feature.
4. **LLM System Prompt / Guardrails**: The documentation explicitly states the LLM should answer "ONLY on the provided course material" and say "I couldn't find this..." otherwise. The actual `ChatLlmService` prompt includes a `CRITICAL INSTRUCTION` to explicitly answer general knowledge questions using world knowledge, violating the strict RAG constraint.
5. **Web Search Integration**: `ChatLlmService` dynamically fetches real-time web context using Tavily or DuckDuckGo. This is entirely undocumented in the RAG pipeline documentation.
6. **File Size Limits**: The documentation specifies a 50MB upload limit, while `DocumentsService` enforces a strict 10MB limit.
7. **Semantic Chunking**: The documentation describes a detailed chunking strategy based on headings, paragraph breaks, and sentence boundaries. The actual implementation in `PdfProcessorService` is simpler, using regex for headings and splitting purely based on `MAX_CHUNK_LENGTH` with a calculated `CHUNK_OVERLAP`, ignoring sentence/paragraph boundaries.

## Missing Features
1. **Citation Extraction & SSE Streaming**: The documentation describes a detailed streaming format emitting structured JSON objects (`{ type: 'token' }` and `{ type: 'citation' }`) and an `extractCitations` function that maps `[citation:INDEX]` to actual chunks on the fly. The current `ChatLlmService.streamChat` simply yields raw text strings and completely lacks citation extraction logic.
