import { UploadUrlSchema } from '@studymate/shared';
import type { z } from 'zod';

export const CreateUploadUrlSchema = UploadUrlSchema;
export type CreateUploadUrlDto = z.infer<typeof UploadUrlSchema>;
