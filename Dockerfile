FROM node:20 AS builder
WORKDIR /app

ARG API_BASE_URL
ENV VITE_API_BASE_URL=$API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]