FROM node:24-alpine AS deps

# set the working directory to /app
WORKDIR /app

# copy package.json for dep installation
COPY package*.json ./

# copy nextjs content
COPY . .

# run npm clean install to install deps
RUN npm install


FROM node:24-alpine AS builder

# set the working directory to /app
WORKDIR /app

# copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# build the next app
RUN npm run build

FROM node:24-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

# copy all needed files for prisma
COPY --from=deps ./app/prisma prisma
COPY --from=deps ./app/prisma/dev.db /app/dev.db
RUN npx prisma generate --schema=./prisma/schema.prisma


COPY --from=builder /app/public ./public

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# expose port 3000
EXPOSE 3000

# set port 3000 to env
ENV PORT=3000

# command to run the app
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
