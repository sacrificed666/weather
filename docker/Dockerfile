# syntax=docker/dockerfile:1

# Node.js on Alpine, pinned by digest; shared by every stage
FROM node:26.10-alpine@sha256:0b36e8c136b94cd4fcf02188228e76c31ad5872eef3fec8cbd2eee500cfd9e80 AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Dependencies, cached until the lockfile changes
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# Dev server with hot reload for docker/development.yaml
FROM deps AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

# Production build; the environment file is a secret mount, never a layer
FROM deps AS build
ARG APP_ENV=production
ENV APP_ENV=${APP_ENV} NEXT_OUTPUT=standalone
COPY . .
RUN --mount=type=secret,id=env,target=/app/.env.production npm run build

# Non-root standalone server without the .env files Next.js copies into it
FROM base AS runtime
ARG APP_ENV=production
ENV NODE_ENV=production APP_ENV=${APP_ENV} HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node --exclude=.env* /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
# Runs as the unprivileged node user
USER node
EXPOSE 3000
# Docker marks the container unhealthy when /healthz stops answering
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "server.js"]
