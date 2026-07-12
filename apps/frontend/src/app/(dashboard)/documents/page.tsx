'use client';

import { UploadZone } from '@/components/documents/upload-zone';
import { DocumentCard } from '@/components/documents/document-card';
import { useDocuments } from '@/hooks/use-documents';
import { useAiModelPreferences } from '@/hooks/use-ai-models';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFileLines, faFolderOpen, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { handleApiError } from '@/lib/error-handler';
import { toast } from 'sonner';
import { useApiClient } from '@/lib/api-client';

export default function DocumentsPage() {
  const { documents, isLoading, mutate, deleteDocument, updateDocument } = useDocuments();
  const { pdfProvider } = useAiModelPreferences();
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

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadRes.ok) {
        toast.error('Upload failed with status ' + uploadRes.status);
        setIsUploading(false);
        return;
      }

      if (onProgress) onProgress(100);

      // Kick off processing in the background (returns immediately)
      await api.post(`/documents/${id}/process`, { pdfProvider });

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
    <div className="pb-10">
      
      {/* ── Hero Control Panel ────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-border/50 bg-surface-1/40 p-6 sm:p-8 lg:p-10 mb-10 shadow-lg glass group">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-brand-500/10 opacity-70" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-50" />
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center justify-between">
          <div className="flex-1 w-full text-center lg:text-left">
            <div className="inline-flex items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-4 mb-6">
              <FontAwesomeIcon icon={faFolderOpen} className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
              Document Library
            </h1>
            <p className="text-base sm:text-lg text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Upload your PDFs here. We will instantly extract, chunk, and embed every single page into your personal semantic vector store for lightning-fast retrieval.
            </p>
          </div>
          
          <div className="w-full lg:w-[400px] shrink-0">
            <UploadZone 
              onUpload={handleUpload} 
              className="bg-surface-2/80 backdrop-blur-xl shadow-2xl rounded-3xl border-border/60" 
            />
          </div>
        </div>
      </header>

      {/* ── Document Grid ────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between px-1 mb-6">
          <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <FontAwesomeIcon icon={faFileLines} className="w-4 h-4 text-cyan-500" /> Your Files
          </h2>
          {!isLoading && documents.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-bold text-muted-fg border border-border">
              {documents.length} File{documents.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="text-lg font-bold text-foreground animate-pulse">
              Loading your documents...
            </p>
          </div>
        ) : documents.length === 0 ? (
          <div className="glass-card mt-4 flex flex-col items-center gap-4 py-20 text-center rounded-2xl md:rounded-3xl border-dashed border-2 hover:border-cyan-500/30 transition-colors">
            <div className="rounded-2xl bg-cyan-500/10 p-5 border border-cyan-500/20">
              <FontAwesomeIcon icon={faUpload} className="text-cyan-400 w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                Your library is empty
              </p>
              <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
                Drag and drop your first PDF into the upload zone above to start building your AI knowledge base.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max">
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
      </section>
    </div>
  );
}
