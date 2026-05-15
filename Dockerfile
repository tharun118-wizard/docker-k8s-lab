# ── Stage 1: Build ───────────────────────────────────────────────────
# Use Alpine (5 MB) variant of Node 18 for a lean base image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy ONLY the package files first.
# Docker caches this layer; if package.json hasn't changed,
# the next RUN (npm ci) is served from cache — much faster rebuilds.
COPY package*.json ./

# npm ci = clean install from lockfile (reproducible, no network surprises)
RUN npm ci --only=production

# ── Stage 2: Runtime ─────────────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# dumb-init properly forwards signals to Node.js (graceful shutdown)
RUN apk add --no-cache dumb-init

# Copy only the production node_modules from Stage 1
COPY --from=builder /app/node_modules ./node_modules

# Copy application source files
COPY app.js .
COPY public ./public

# Document which port the app listens on (informational, does not publish)
EXPOSE 4000

# Docker health check — polls the /api/health endpoint every 30 s
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/api/health', \
        (r)=>{process.exit(r.statusCode===200?0:1)})" || exit 1

# Run as non-root for security (node user exists in node:alpine images)
USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "app.js"]
