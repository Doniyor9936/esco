FROM oven/bun:1.2-alpine AS builder

WORKDIR /app

ENV HUSKY=0

COPY package.json bun.lock ./
COPY tsconfig.json ./tsconfig.json
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/frontend/tsconfig.json ./apps/frontend/tsconfig.json
COPY shared/package.json shared/package.json

RUN bun install --frozen-lockfile

COPY shared ./shared
COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend

RUN bun run vite build

FROM nginx:1.27-alpine

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

