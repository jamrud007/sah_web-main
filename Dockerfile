# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# ✅ No need to change port — Nginx uses standard port 80 internally
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
