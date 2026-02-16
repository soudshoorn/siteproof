FROM ghcr.io/puppeteer/puppeteer:latest

USER root

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install all deps (including devDeps for TypeScript build)
RUN npm ci --ignore-scripts

# Copy Prisma schema and generate client (needed for types)
COPY prisma ./prisma
COPY prisma.config.ts ./
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

# Remove devDependencies after build
RUN npm prune --omit=dev

ENV NODE_ENV=production

# Switch back to non-root user for security
USER pptruser

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/workers/server.js"]
