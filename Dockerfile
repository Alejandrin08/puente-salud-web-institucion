# Compila la SPA y la sirve con nginx sin privilegios en el puerto 8080
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG VITE_API_URL=http://localhost:8000
ARG VITE_MAP_STYLE=https://tiles.openfreemap.org/styles/positron
ENV VITE_API_URL=$VITE_API_URL VITE_MAP_STYLE=$VITE_MAP_STYLE
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
