# syntax=docker/dockerfile:1

# Сборка Vite + React (артефакт в dist/)
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig.json ./
COPY public ./public
COPY src ./src

RUN npm run build

# Только статика + nginx (без Node в рантайме)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# public/ явно в корень — favicon, robots.txt, sitemap.xml (не полагаемся только на vite build)
COPY --from=build /app/public/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
