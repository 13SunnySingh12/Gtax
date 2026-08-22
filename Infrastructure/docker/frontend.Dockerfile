# G-TAX React frontend — build context: repo root (needs the nginx.conf under
# Infrastructure/). Builds the static bundle, then serves it with nginx.
FROM node:20-alpine AS build
WORKDIR /app
COPY Frontend/package*.json ./
RUN npm ci
COPY Frontend/ ./

# VITE_* values are baked in at build time (browser bundle). Pass via build args.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_BASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:alpine
COPY Infrastructure/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
