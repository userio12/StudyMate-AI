# Storage Service (Supabase Storage)

## Overview

File storage uses Supabase Storage with presigned URLs for secure, direct client uploads. Files never pass through the backend server — the client uploads directly to Supabase, which eliminates server-side file buffering and reduces latency.

## Architecture

```
1. Client requests upload URL ──► Backend generates presigned URL (Supabase)
2. Backend returns URL + key  ◄── Supabase Storage
3. Client PUTs file directly  ──► Supabase stores file
4. Client POSTs /process      ──► Backend starts pipeline
5. Backend GETs file          ──► Supabase returns file via signed URL
```

## Service Implementation

```typescript
// storage/storage.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private supabase: SupabaseClient | null;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (url && key) {
      this.supabase = createClient(url, key, {
        auth: { persistSession: false },
      });
    } else {
      this.supabase = null;
    }

    this.bucket = this.configService.get<string>('SUPABASE_STORAGE_BUCKET')!;
  }

  async generateUploadUrl(key: string, _contentType: string): Promise<string> {
    if (!this.supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUploadUrl(key);

    if (error || !data) throw new Error(error?.message);
    return data.signedUrl;
  }

  async generateDownloadUrl(key: string): Promise<string> {
    if (!this.supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUrl(key, 3600); // 1 hour expiry

    if (error || !data) throw new Error(error?.message);
    return data.signedUrl;
  }

  async deleteObject(key: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase not configured');
    
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([key]);

    if (error) throw new Error(error.message);
  }
}
```

## Supabase Bucket Configuration

The bucket must be configured with specific Row Level Security (RLS) policies in the Supabase Dashboard, or left open for service-role interactions. Our implementation uses the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS internally.

### Upload Flow (Client-Side)

```typescript
// frontend/hooks/use-documents.ts
async function uploadDocument(file: File): Promise<Document> {
  // 1. Get presigned URL from backend
  const { documentId, presignedUrl, s3Key } = await apiClient.post(
    '/documents/upload-url',
    {
      fileName: file.name,
      contentType: 'application/pdf',
      fileSize: file.size,
    },
  );

  // 2. Upload directly to Supabase Storage
  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': 'application/pdf' },
  });

  if (!uploadResponse.ok) {
    throw new Error('Upload to storage failed');
  }

  // 3. Start processing pipeline
  await apiClient.post(`/documents/${documentId}/process`);

  // 4. Poll for completion
  return pollDocumentStatus(documentId);
}
```

## File Organization in Storage

```
studymate-ai-uploads/ (bucket)
├── uploads/
│   ├── user_abc/
│   │   ├── 1718300000000-machine-learning-notes.pdf
│   │   ├── 1718300100000-database-systems.pdf
│   │   └── 1718300200000-artificial-intelligence.pdf
│   ├── user_def/
│   │   ├── 1718300300000-algorithms.pdf
│   │   └── 1718300400000-data-structures.pdf
│   └── ...
```

**Key structure:** `uploads/{userId}/{timestamp}-{sanitizedFileName}`

Benefits of this structure:
- Partition by userId for easy lookup
- Timestamp prefix prevents name collisions
- Sanitized names are human-readable
