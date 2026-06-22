# =============================================================================
# ShikshaSarthi – Lean Production Docker Image (Standard School Server)
# =============================================================================

# ─── Stage 1: Build the React frontend ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Exclude folders that shouldn't be in the build context
RUN rm -rf QuestionGenerator
RUN npm run build

# ─── Stage 2: Production image (nginx + Node backend) ──────────────────────
FROM nginx:1.27-alpine

# Install node + npm
RUN apk add --no-cache nodejs npm

# ── Backend code ──
WORKDIR /app
COPY backend/ ./backend/
# EXPLICITLY NOT COPYING QuestionGenerator
COPY package.json package-lock.json ./

# Install ONLY production backend deps
RUN cd backend && npm ci --omit=dev

# ── Frontend build ──
COPY --from=builder /build/dist /usr/share/nginx/html

# ── Nginx config ──
COPY nginx.conf /etc/nginx/nginx.conf

# ── Entrypoint ──
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["docker-entrypoint.sh"]
