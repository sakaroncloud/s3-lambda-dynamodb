# Base image using Node.js 22 on Alpine Linux for a lightweight container
FROM node:22-alpine AS base

# Install curl (useful for health checks and debugging)
RUN apk add --no-cache curl

# --- Dependencies Stage ---
FROM base AS deps

# Install compatibility libraries for glibc-based dependencies
RUN apk add --no-cache libc6-compat

# Set working directory inside the container
WORKDIR /app

# Copy package manager files for dependency installation
COPY package.json pnpm-lock.yaml* .npmrc* ./

# Enable pnpm package manager and install dependencies with frozen lockfile
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# --- Build Stage ---
FROM base AS builder

# Set working directory inside the container
WORKDIR /app

# Copy installed dependencies from the previous stage to avoid re-downloading
COPY --from=deps /app/node_modules ./node_modules

# Copy all source code into the container
COPY . .

# Set environment variables for build-time configuration
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
ARG NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL

# # Set them as env for build and runtime
# ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL
# ENV NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
# ENV NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL

# Build the Next.js application
RUN corepack enable pnpm && pnpm run build

# Remove unnecessary development dependencies to reduce image size
RUN pnpm prune --prod

# --- Production Runner Stage ---
FROM base AS runner

# Set working directory inside the container
WORKDIR /app

# Define environment variables for production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security purposes
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files for production
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set user to the non-root user for security
USER nextjs

# Expose application port
EXPOSE 3000

# Define environment variables for runtime
ENV PORT=3000
ENV NODE_ENV=production

# Command to start the Next.js application
CMD ["node", "server.js"]