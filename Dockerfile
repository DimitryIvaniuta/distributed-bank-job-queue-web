# syntax=docker/dockerfile:1.7
FROM node:24.18.0-alpine AS dependencies
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM dependencies AS verification
COPY . .
RUN npm run typecheck \
    && npm run lint \
    && npm run test:coverage \
    && npm run build

FROM nginxinc/nginx-unprivileged:1.31.2-alpine3.23-slim AS runtime
LABEL org.opencontainers.image.title="BankFlow Queue Console" \
      org.opencontainers.image.description="Production React console for the distributed banking job queue" \
      org.opencontainers.image.version="1.1.0" \
      org.opencontainers.image.licenses="MIT"
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=verification /workspace/dist /usr/share/nginx/html
EXPOSE 8080
USER 101
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
