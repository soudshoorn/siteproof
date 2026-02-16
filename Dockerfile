FROM ghcr.io/puppeteer/puppeteer:latest

ENV NODE_ENV=production

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

RUN npm ci --only=production --ignore-scripts

# Copy Prisma schema and generate client (needed for types)
COPY prisma ./prisma
RUN npx prisma generate

# Copy worker source and shared lib code
COPY workers ./workers
COPY src/lib/scanner ./src/lib/scanner
COPY src/lib/eaa ./src/lib/eaa
COPY src/lib/email ./src/lib/email
COPY src/lib/db.ts ./src/lib/db.ts
COPY src/lib/mollie/plans.ts ./src/lib/mollie/plans.ts
COPY tsconfig.json ./

# Build the worker
RUN npx tsc -p workers/tsconfig.json

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/workers/server.js"]
