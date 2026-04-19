# stage 1: build frontend to single index.html
FROM oven/bun AS frontend

WORKDIR /app

# Copy package.json and bun.lock
COPY web-app/package.json web-app/bun.lock ./

# Install dependencies#
RUN bun install

# Copy the frontend
COPY web-app /app/

# Build frontend
RUN bun run build

# stage 2: Build GO binary
FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum* ./

RUN go mod download

# Pre-compile go-sqlite3 to avoid doing this every time
# RUN CGO_ENABLED=1 go build -tags musl -o /dev/null github.com/mattn/go-sqlite3

# Copy frontend build files
COPY --from=frontend /app/dist /app/web-app/dist

# Copy GO source files
COPY *.go .
COPY internal ./internal

RUN CGO_ENABLED=0 go build -tags musl -ldflags="-s -w" -o main .

# stage 3: build minimal run image
FROM scratch

ENV GIN_MODE=release

WORKDIR /app

# Copy GO Binary
COPY --from=builder /app/main .

# Expose Port
EXPOSE 6060

# Command to run Application
ENTRYPOINT ["./main"]
