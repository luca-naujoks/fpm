FROM node:24-slim AS deps

# set the working directory to /app
WORKDIR /app

# copy package.json for dep installation
COPY package*.json ./

# run npm clean install to install deps
RUN npm install


FROM node:24-slim AS builder

# set the working directory to /app
WORKDIR /app

# copy nextjs content
COPY . .

# copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# create empty database file and run migrations
RUN touch ./prisma/dev.db
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npx prisma migrate deploy --schema=./prisma/schema.prisma

# build the next app
RUN npm run build

FROM node:24-slim AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies needed for prisma CLI at runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/public ./public

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# copy prisma folder with schema, migrations, and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# expose port 3000
EXPOSE 3000

# command to run migrations on startup and then start the app
ENV HOSTNAME="0.0.0.0"
CMD npx prisma migrate deploy --schema=./prisma/schema.prisma && node server.js
