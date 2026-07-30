FROM node:22-alpine AS builder

WORKDIR /app

# Apply security updates to Alpine base image
RUN apk update && apk upgrade --no-cache

# Install pnpm and dependencies
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prefer-offline

# Copy source code
COPY . .

# Build the application with environment variables
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN pnpm build

# Production stage - use nginx base image and apply security updates
FROM nginx:1.27-alpine AS production

# Apply security updates to Alpine base image
RUN apk update && apk upgrade --no-cache

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]