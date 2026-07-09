'use client';

import { UploadZone } from '@/components/documents/upload-zone';
import { DocumentCard } from '@/components/documents/document-card';
import { useDocuments } from '@/hooks/use-documents';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { handleApiError } from '@/lib/error-handler';
import { toast } from 'sonner';
import { useApiClient } from '@/lib/api-client';

export default function DocumentsPage() {
  const { documents, isLoading, mutate, deleteDocument, updateDocument } = useDocuments();
  const api = useApiClient();

  const handleUpload = async (file: File, onProgress?: (progress: number) => void) => {
    try {
      const { id, uploadUrl, s3Key } = await api.post<{
        id: string;
        uploadUrl: string;
        s3Key: string;
      }>('/documents/upload-url', {
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            onProgress(percentComplete);
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error('Upload failed with status ' + xhr.status));
        };
        
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(file);
      });

      if (onProgress) onProgress(100);

      // Kick off processing in the background (returns immediately)
      await api.post(`/documents/${id}/process`);

      // Immediately refresh the document list so SWR sees the 'processing' doc
      // and starts polling every 3s to track real progress via DocumentCard.
      await mutate();

      toast.success('Document uploaded — processing in background');
    } catch (err) {
      toast.error(handleApiError(err));
      throw err; // throw so UploadZone can catch and show error state
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">
        Documents
      </h1>
      <p className="mt-1 text-sm text-muted">
        Upload and manage your study materials.
      </p>

      <div className="mt-6">
        <UploadZone onUpload={handleUpload} />
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-white/30 dark:bg-white/5"
            />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="glass-card mt-12 flex flex-col items-center gap-3 py-16 text-center">
          <div className="rounded-full bg-surface-2 p-4 border border-border/50">
            <FontAwesomeIcon icon={faUpload} className="text-muted w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-muted">
            No documents yet. Upload your first PDF above.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              id={doc.id}
              title={doc.title}
              status={doc.status}
              progress={doc.progress}
              isPinned={doc.isPinned}
              createdAt={doc.createdAt}
              onDelete={deleteDocument}
              onUpdate={updateDocument}
            />
          ))}
        </div>
      )}
    </div>
  );
}
