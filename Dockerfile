# Stage base
FROM oven/bun:1 AS base

WORKDIR /app
COPY package.json bun.lockb ./

# Stage builder
FROM base AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run prisma:generate
RUN bun run build

ENTRYPOINT [ "bun", "run", "start" ]