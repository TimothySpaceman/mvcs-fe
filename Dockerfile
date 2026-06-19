ARG NODE_VERSION=24.13.0-slim

# ============================================
# Stage 1: Build
# ============================================

FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --no-fund --include=optional

COPY . ./

ENV NODE_ENV=production

RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# ============================================
# Stage 2: Runner
# ============================================

FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ARG PORT=3000

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=${PORT}

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE ${PORT}

CMD ["node", "server.js"]