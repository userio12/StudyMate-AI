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
    if (!this.supabase) throw new Error('Supabase not configured \u2014 missing credentials');
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .createSignedUploadUrl(key);

      if (error || !data) {
        throw new Error(error?.message || 'Unknown error generating upload URL');
      }

      return data.signedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate upload URL for ${key}:`, error);
      throw new Error('Could not generate upload URL', { cause: error });
    }
  }

  async generateDownloadUrl(key: string): Promise<string> {
    if (!this.supabase) throw new Error('Supabase not configured \u2014 missing credentials');
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .createSignedUrl(key, 3600);

      if (error || !data) {
        throw new Error(error?.message || 'Unknown error generating download URL');
      }

      return data.signedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate download URL for ${key}:`, error);
      throw new Error('Could not generate download URL', { cause: error });
    }
  }

  async deleteObject(key: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase not configured \u2014 missing credentials');
    try {
      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([key]);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      this.logger.error(`Failed to delete object ${key}:`, error);
      throw new Error('Failed to delete storage object', { cause: error });
    }
  }
}
