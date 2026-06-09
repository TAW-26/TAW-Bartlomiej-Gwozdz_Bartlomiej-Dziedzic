FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 4200

# Runs the Angular dev server (matches the documented "ng serve" workflow) and
# proxies /api to the backend container so relative API calls keep working
# both for client- and server-side rendered requests. "--allowed-hosts true"
# is needed because the page is requested through the "localhost" mapped from
# the Docker host rather than the container's own hostname.
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--allowed-hosts", "true", "--proxy-config", "proxy.conf.docker.json"]
