# ── Stage 1: Build React app ──────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────────
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/dist .

# Copy nginx template (uses $PORT via envsubst)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

# Railway sets PORT — default to 80 if not set
ENV PORT=80

EXPOSE 80

# nginx docker image runs envsubst on /etc/nginx/templates/*.template
# automatically — this is built into the official nginx:alpine image
CMD ["nginx", "-g", "daemon off;"]
