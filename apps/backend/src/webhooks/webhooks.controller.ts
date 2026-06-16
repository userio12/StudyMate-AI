import { Body, Controller, Post, Headers, UnauthorizedException, OnApplicationShutdown } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service.js';
import { Public } from '../auth/guards/public.decorator.js';
import { users } from '@studymate/db';
import { eq } from 'drizzle-orm';
import { createHmac, timingSafeEqual } from 'node:crypto';

const REPLAY_TTL = 300_000;
const processedIds = new Map<string, number>();
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [id, ts] of processedIds) {
    if (now - ts > REPLAY_TTL) processedIds.delete(id);
  }
}, REPLAY_TTL).unref();

@Public()
@SkipThrottle()
@Controller('webhooks/clerk')
export class WebhooksController implements OnApplicationShutdown {
  constructor(
    private configService: ConfigService,
    private db: DatabaseService,
  ) {}

  onApplicationShutdown() {
    clearInterval(cleanupInterval);
  }

  @Post()
  async handleClerkWebhook(
    @Headers('svix-id') svixId: string | undefined,
    @Headers('svix-timestamp') svixTimestamp: string | undefined,
    @Headers('svix-signature') svixSignature: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    const secret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');

    if (!svixId || !svixTimestamp || !svixSignature || !secret) {
      throw new UnauthorizedException('Missing webhook headers or secret');
    }

    const timestamp = Number.parseInt(svixTimestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Number.isNaN(timestamp) || now - timestamp > 300) {
      throw new UnauthorizedException('Webhook timestamp too old or invalid');
    }

    if (processedIds.has(svixId)) {
      return { received: true };
    }

    const signedContent = `${svixId}.${svixTimestamp}.${JSON.stringify(body)}`;
    const computed = createHmac('sha256', secret)
      .update(signedContent)
      .digest('base64');

    const signatures = svixSignature.split(',').map((s) => s.trim().replace(/^v\d+=/, ''));
    const isValid = signatures.some((sig) => {
      try {
        const a = Buffer.from(computed);
        const b = Buffer.from(sig);
        return a.length === b.length && timingSafeEqual(a, b);
      } catch {
        return false;
      }
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    processedIds.set(svixId, Date.now());

    const type = body.type as string | undefined;

    if (type === 'user.created' || type === 'user.updated') {
      const data = body.data as Record<string, unknown> | undefined;
      const clerkId = data?.id as string | undefined;
      if (!clerkId) return { received: true };

      const emailAddresses = data?.email_addresses as Array<{ email_address: string }> | undefined;
      const email = emailAddresses?.[0]?.email_address ?? '';
      const name = `${data?.first_name ?? ''} ${data?.last_name ?? ''}`.trim() || null;
      const avatarUrl = data?.image_url as string | undefined;

      const existing = await this.db.db!.query.users.findFirst({
        where: eq(users.clerkId, clerkId),
      });

      if (existing) {
        await this.db.db!
          .update(users)
          .set({ email, name, avatarUrl })
          .where(eq(users.clerkId, clerkId));
      } else {
        await this.db.db!.insert(users).values({
          id: crypto.randomUUID(),
          clerkId,
          email,
          name,
          avatarUrl,
        });
      }
    }

    if (type === 'user.deleted') {
      const data = body.data as Record<string, unknown> | undefined;
      const clerkId = data?.id as string | undefined;
      if (clerkId) {
        await this.db.db!.delete(users).where(eq(users.clerkId, clerkId));
      }
    }

    return { received: true };
  }
}
