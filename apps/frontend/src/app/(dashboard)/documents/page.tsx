'use client';

import { UploadZone } from '@/components/documents/upload-zone';
import { DocumentCard } from '@/components/documents/document-card';
import { useDocuments } from '@/hooks/use-documents';
import { Loader2 } from 'lucide-react';
import { handleApiError } from '@/lib/error-handler';
import { toast } from 'sonner';
import { useApiClient } from '@/lib/api-client';

export default function DocumentsPage() {
  const { documents, isLoading, mutate } = useDocuments();
  const api = useApiClient();

  const handleUpload = async (file: File) => {
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

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      await api.post(`/documents/${id}/process`);
      await mutate();
      toast.success('Document uploaded successfully');
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-navy-800 dark:text-parchment-100">
        Documents
      </h1>
      <p className="mt-1 text-sm leading-relaxed text-navy-600 dark:text-parchment-400">
        Upload and manage your study materials.
      </p>

      <div className="mt-6">
        <UploadZone onUpload={handleUpload}>
          <div />
        </UploadZone>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-parchment-200 dark:bg-navy-800"
            />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <div className="studymate-glow rounded-full p-4">
            <Loader2 size={24} className="text-white" />
          </div>
          <p className="text-sm leading-relaxed text-navy-600 dark:text-parchment-400">
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
              createdAt={doc.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
