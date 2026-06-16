# Frontend Deployment

## Platform: Vercel

Vercel offers zero-configuration deployment for Next.js applications.

### Project Configuration

| Setting | Value |
|---|---|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/frontend` |
| **Build Command** | `cd ../.. && pnpm build --filter frontend` |
| **Output Directory** | `.next` |
| **Install Command** | `pnpm install --frozen-lockfile` |
| **Node Version** | 22.x |

### Environment Variables

Set in Vercel Dashboard → Project Settings → Environment Variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxx
CLERK_SECRET_KEY=sk_live_xxxx
NEXT_PUBLIC_API_URL=https://studymate-api.onrender.com/api
NEXT_PUBLIC_APP_URL=https://studymate-ai.vercel.app
```

### Custom Domain

1. Go to Vercel Dashboard → Domains
2. Add `studymate-ai.com` (or your domain)
3. Update DNS records:
   - `A` record → `76.76.21.21`
   - `CNAME` `www` → `cname.vercel-dns.com`
4. Wait for SSL provisioning (automatic)

### Dockerfile

```dockerfile
# docker/Dockerfile.frontend
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy monorepo manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter frontend

# Copy source
COPY apps/frontend/ ./apps/frontend/
COPY packages/ ./packages/

# Build
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN pnpm --filter frontend build

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

## Vercel Configuration

```json
// vercel.json (in apps/frontend/)
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm build --filter frontend",
  "outputDirectory": ".next",
  "installCommand": "pnpm install --frozen-lockfile",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://studymate-api.onrender.com/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

## CI/CD

### Automatic Deploys

- **Preview Deployments**: Every pull request gets a unique URL
- **Production Deploy**: Merges to `main` trigger production deploy
- **Automatic SSL**: Vercel provisions and renews SSL certificates

### Manual Deploy

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Performance Budget

| Metric | Target |
|---|---|
| **Lighthouse Performance** | ≥ 90 |
| **Lighthouse Accessibility** | ≥ 95 |
| **Lighthouse Best Practices** | ≥ 90 |
| **Lighthouse SEO** | ≥ 95 |
| **First Contentful Paint (FCP)** | ≤ 1.5s |
| **Largest Contentful Paint (LCP)** | ≤ 2.5s |
| **First Input Delay (FID)** | ≤ 100ms |
| **Cumulative Layout Shift (CLS)** | ≤ 0.1 |
| **Time to Interactive (TTI)** | ≤ 3.5s |
| **JavaScript Bundle (initial)** | ≤ 200KB |

## Monitoring

### Vercel Analytics

Enable in Vercel Dashboard → Analytics:
- **Web Vitals**: Real-user performance metrics
- **Page views**: Traffic analysis
- **Audiences**: User geography, device, browser

### Error Tracking (Sentry)

```typescript
// sentry.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

## Post-Deployment Checklist

- [ ] Landing page loads and is SEO-optimized (`curl -I https://studymate-ai.com`)
- [ ] Sign-in flow works end-to-end (Clerk test account)
- [ ] API proxy is working (`/api/*` redirects to production backend)
- [ ] Custom domain has valid SSL certificate
- [ ] Environment variables are set correctly (no `localhost` references)
- [ ] Sitemap is accessible (`/sitemap.xml`)
- [ ] `robots.txt` allows search engine crawling
- [ ] Open Graph images render correctly on social media preview
- [ ] Lighthouse audit passes for all 4 categories
- [ ] Error tracking (Sentry) is receiving events
- [ ] Analytics (Vercel) is tracking page views
- [ ] CORS allows the production frontend domain
