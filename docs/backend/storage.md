# Storage Service (AWS S3)

## Overview

File storage uses AWS S3 with presigned URLs for secure, direct client uploads. Files never pass through the backend server — the client uploads directly to S3, which eliminates server-side file buffering and reduces latency.

## Architecture

```
1. Client requests upload URL ──► Backend generates presigned URL
2. Backend returns URL + documentId ◄── S3
3. Client PUTs file directly to S3 ──► S3 stores file
4. Client POSTs /documents/:id/process ──► Backend starts pipeline
5. Backend GETs file from S3 (in server context) ──► S3 returns file
```

## Service Implementation

```typescript
// storage/storage.service.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.s3 = new S3Client({
      region: config.awsRegion,
      credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
      },
    });
    this.bucket = config.awsS3Bucket;
  }

  /**
   * Generate a presigned URL for direct client upload.
   * URL expires in 5 minutes (300 seconds).
   */
  async generateUploadUrl(
    userId: string,
    fileName: string,
    contentType: string,
  ): Promise<{ presignedUrl: string; s3Key: string }> {
    const sanitizedFileName = this.sanitizeFileName(fileName);
    const s3Key = `uploads/${userId}/${Date.now()}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 300, // 5 minutes
    });

    return { presignedUrl, s3Key };
  }

  /**
   * Download a file from S3 (used by PDF processor).
   * Returns a Buffer for server-side processing.
   */
  async download(s3Key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
    });

    const response = await this.s3.send(command);
    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  /**
   * Delete a file from S3 (used when document is deleted).
   */
  async delete(s3Key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
    });

    await this.s3.send(command);
  }

  /**
   * Generate a presigned URL for reading (used for client-side preview).
   * URL expires in 1 hour.
   */
  async generateReadUrl(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
    });

    return getSignedUrl(this.s3, command, {
      expiresIn: 3600, // 1 hour
    });
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .toLowerCase();
  }
}
```

## S3 Bucket Configuration

### CORS Policy

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "http://localhost:3000",
        "https://studymate-ai.vercel.app"
      ],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

### IAM Policy (for backend service account)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::studymate-ai-uploads/*"
    }
  ]
}
```

**Note:** The IAM user only needs Put, Get, and Delete on the specific bucket. No listing, no cross-region replication, no lifecycle management from the API layer.

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

  // 2. Upload directly to S3
  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': 'application/pdf' },
  });

  if (!uploadResponse.ok) {
    throw new Error('Upload to S3 failed');
  }

  // 3. Start processing pipeline
  await apiClient.post(`/documents/${documentId}/process`);

  // 4. Poll for completion
  return pollDocumentStatus(documentId);
}
```

## File Validation

Validation happens at two levels:

**1. Client-side (before upload):**
```typescript
// File size
if (file.size > 50 * 1024 * 1024) throw new Error('File exceeds 50MB limit');

// File type
if (file.type !== 'application/pdf') throw new Error('Only PDF files are accepted');
```

**2. Server-side (when generating presigned URL):**
```typescript
// In DocumentsController
@Post('upload-url')
@UsePipes(new ZodValidationPipe(UploadUrlSchema))
async getUploadUrl(
  @CurrentUser('id') userId: string,
  @Body() body: z.infer<typeof UploadUrlSchema>,
) {
  const result = await this.documentsService.createUploadRequest(
    userId,
    body.fileName,
    body.contentType,
    body.fileSize,
  );

  return { data: result };
}

// Validation rules:
// - fileName: 1-255 chars
// - contentType: exactly 'application/pdf'
// - fileSize: max 52,428,800 bytes (50MB)
```

## File Organization in S3

```
studymate-ai-uploads/
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
- Sanitized names are human-readable in S3 console

## Cleanup Strategy

When a document is deleted:
1. Backend deletes S3 object via `StorageService.delete(s3Key)`
2. DB cascades deletion to chunks, conversations, messages, quizzes
3. If S3 deletion fails, the operation still succeeds (orphan file is <50MB and cleaned up by lifecycle policy)

**S3 Lifecycle Rule:**
```json
{
  "Rules": [
    {
      "Status": "Enabled",
      "Prefix": "uploads/",
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```
