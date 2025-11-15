### Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

### Stage 2: Build app
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

### Stage 3: Serve with Caddy
FROM caddy:alpine AS runner
WORKDIR /srv
COPY --from=build /app/build .

# Caddyfile for static serving
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 8086
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
