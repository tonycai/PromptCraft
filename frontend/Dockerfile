# Stage 1: Dependencies
FROM node:18-alpine AS deps

WORKDIR /app

# Copy package.json and lock file
COPY package.json package-lock.json* yarn.lock* ./

# Install dependencies based on lock file
# (Assumes Next.js project will be in a 'frontend' directory)
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Stage 2: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all source files
COPY . .

# Environment variables for build time (e.g., API URL)
ENV NEXT_PUBLIC_API_URL="http://localhost:8000/api/v1"
# For production, this should point to your actual backend URL

# Build the Next.js application
RUN npm run build

# Stage 3: Runner (Production)
FROM node:18-alpine AS runner

WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application from builder stage (standalone output)
COPY --from=builder /app/.next/standalone ./ 
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
# ENV NEXT_PUBLIC_API_URL will be passed through or set here again if needed for runtime

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:${PORT}/ || exit 1
  # Adjust path if you have a specific health check page in Next.js

CMD ["node", "server.js"] 