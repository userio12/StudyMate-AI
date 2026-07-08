'use client';

import * as React from 'react';
import { useAuth } from '@clerk/nextjs';
import { useApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons';
import useSWR from 'swr';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
  const { getToken } = useAuth();
  const api = useApiClient();
  const [preferredModel, setPreferredModel] = React.useState('');
  const [ocrModel, setOcrModel] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Fetch available models
  const { data, isLoading } = useSWR('/ai/models', async (url) => {
    const res = await api.get<{ models: string[] }>(url);
    return res.models;
  });

  // Fetch user preferences
  const { data: prefs, isLoading: prefsLoading } = useSWR('/ai/preferences', async (url) => {
    const res = await api.get<{ preferredModel: string; ocrModel: string }>(url);
    return res;
  });

  React.useEffect(() => {
    if (prefs) {
      if (!preferredModel && prefs.preferredModel) setPreferredModel(prefs.preferredModel);
      if (!ocrModel && prefs.ocrModel) setOcrModel(prefs.ocrModel);
    }
  }, [prefs]);

  const handleSave = async () => {
    if (!preferredModel) return;
    setIsSaving(true);
    setSaved(false);
    try {
      await api.patch('/ai/preferences', { preferredModel, ocrModel });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save preferred model:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-border/50 pb-5">
        <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center">
          <FontAwesomeIcon icon={faGear} className="text-muted w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted">Manage your study preferences and AI models.</p>
        </div>
      </div>

      <div className="bg-surface-1 border border-border/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">AI Model Preference</h2>
        <div className="space-y-4 max-w-md">
          <p className="text-sm text-muted">
            Select the NVIDIA NIM model you want to use for Chat and Quiz generation.
          </p>

          {isLoading || prefsLoading ? (
            <div className="flex items-center gap-2 text-muted text-sm">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />
              Loading available models...
            </div>
          ) : (
            <Select value={preferredModel} onValueChange={setPreferredModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model..." />
              </SelectTrigger>
              <SelectContent>
                {data?.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <h2 className="text-lg font-semibold text-foreground pt-4 mb-2">Document OCR Model</h2>
          <p className="text-sm text-muted">
            Select the NVIDIA model you want to use for extracting text from document images and PDFs.
          </p>

          {prefsLoading ? (
            <div className="flex items-center gap-2 text-muted text-sm">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />
              Loading preferences...
            </div>
          ) : (
            <Select value={ocrModel} onValueChange={setOcrModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select OCR model..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meta/llama-3.2-90b-vision-instruct">
                  LLaMA 3.2 90B Vision (Recommended)
                </SelectItem>
                <SelectItem value="nvidia/nemotron-ocr-v2">
                  NVIDIA Nemotron OCR v2
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          <div className="pt-6">
            <Button
              onClick={handleSave}
              disabled={isSaving || !preferredModel || isLoading}
              className="w-32"
            >
              {isSaving ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />
              ) : saved ? (
                <>
                  <FontAwesomeIcon icon={faCheck} className="mr-2 w-4 h-4" />
                  Saved
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
