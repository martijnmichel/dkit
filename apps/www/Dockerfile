# Static Next export → nginx (build from monorepo root)
#   docker compose -f docker/www/compose.yaml up --build
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/www ./apps/www

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @dkit/www build

FROM nginx:1.27-alpine
COPY apps/www/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/www/out /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
