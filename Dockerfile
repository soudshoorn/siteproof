FROM ghcr.io/puppeteer/puppeteer:latest

ENV NODE_ENV=production

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

RUN npm ci --only=production --ignore-scripts

# Copy Prisma schema and generate client
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

# Health check — ensures the process is running
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD pgrep -f "dist/workers/scanner.js" > /dev/null || exit 1

CMD ["node", "dist/workers/scanner.js"]
