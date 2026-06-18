import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3: S3Client | null;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    if (accessKeyId && secretAccessKey) {
      this.s3 = new S3Client({
        region: this.configService.get<string>('AWS_REGION')!,
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.s3 = null;
    }

    this.bucket = this.configService.get<string>('AWS_S3_BUCKET')!;
  }

  async generateUploadUrl(key: string, contentType: string): Promise<string> {
    if (!this.s3) throw new Error('S3 not configured — missing AWS credentials');
    try {
      const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
      return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    } catch (error) {
      this.logger.error(`Failed to generate upload URL for ${key}:`, error);
      throw new Error('Could not generate upload URL');
    }
  }

  async generateDownloadUrl(key: string): Promise<string> {
    if (!this.s3) throw new Error('S3 not configured — missing AWS credentials');
    try {
      const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
      return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    } catch (error) {
      this.logger.error(`Failed to generate download URL for ${key}:`, error);
      throw new Error('Could not generate download URL');
    }
  }

  async deleteObject(key: string): Promise<void> {
    if (!this.s3) throw new Error('S3 not configured — missing AWS credentials');
    try {
      const command = new DeleteObjectCommand({ Bucket: this.bucket, Key: key });
      await this.s3.send(command);
    } catch (error) {
      this.logger.error(`Failed to delete object ${key}:`, error);
      // We don't always want to throw here to avoid blocking higher-level flows, 
      // but for production-ready state it's often better to throw and handle in service.
      throw new Error('Failed to delete storage object');
    }
  }
}
