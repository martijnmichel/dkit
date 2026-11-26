# Build static Next export and serve with nginx
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc ./
COPY packages ./packages
COPY apps/www ./apps/www
COPY tsconfig.base.json ./
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @dkit/www build

FROM nginx:1.27-alpine
COPY apps/www/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/www/out /usr/share/nginx/html
EXPOSE 80
