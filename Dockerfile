# ShikshaSarthi - Local School Production Image

FROM node:20-alpine AS builder

WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL="/."
ARG VITE_CLOUDINARY_ENABLED=false
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CLOUDINARY_ENABLED=$VITE_CLOUDINARY_ENABLED
RUN npm run build

FROM nginx:1.27-alpine

RUN apk add --no-cache nodejs npm

WORKDIR /app
COPY backend/ ./backend/
COPY QuestionGenerator/ ./QuestionGenerator/
COPY package.json package-lock.json ./

RUN cd backend && npm ci --omit=dev

COPY --from=builder /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["docker-entrypoint.sh"]
