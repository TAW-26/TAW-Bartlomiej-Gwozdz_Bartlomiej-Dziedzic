# --- Build stage: compile Angular app (browser + SSR server) ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Runtime stage: only production deps + compiled output ---
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4200

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 4200

# Runs the Angular SSR server, which serves the compiled static files and
# proxies /api requests to the backend service (BACKEND_URL).
CMD ["node", "dist/client/server/server.mjs"]
