# ─── Stage 1: deps ───────────────────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

# Copy manifests only (better layer caching)
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma/schema.prisma ./prisma/schema.prisma

# Install ALL deps (including prisma dev dep needed for generate)
RUN npm ci

# Generate the Prisma client into ./generated/prisma
RUN npx prisma generate


# ─── Stage 2: production image ───────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only production node_modules + generated client from deps stage
COPY --from=deps /app/node_modules  ./node_modules
COPY --from=deps /app/generated     ./generated

# Copy application source
COPY . .

# Remove dev artifacts not needed at runtime
RUN rm -rf prisma.config.ts

# Switch to non-root user
USER appuser

EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
