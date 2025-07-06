# Stage 1: Build the Next.js frontend
FROM node:20-alpine AS frontend_builder

WORKDIR /app/frontend

# Copy package.json and pnpm-lock.yaml for efficient caching
COPY legal-sentiment-analysis/package.json legal-sentiment-analysis/pnpm-lock.yaml ./
COPY legal-sentiment-analysis/apps/web/package.json ./apps/web/
COPY legal-sentiment-analysis/packages/ui/package.json ./packages/ui/
COPY legal-sentiment-analysis/packages/eslint-config/package.json ./packages/eslint-config/
COPY legal-sentiment-analysis/packages/typescript-config/package.json ./packages/typescript-config/

# Install monorepo dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the frontend code
COPY legal-sentiment-analysis/apps/web/ ./apps/web/
COPY legal-sentiment-analysis/packages/ui/ ./packages/ui/
COPY legal-sentiment-analysis/packages/eslint-config/ ./packages/eslint-config/
COPY legal-sentiment-analysis/packages/typescript-config/ ./packages/typescript-config/
COPY legal-sentiment-analysis/tsconfig.json ./
COPY legal-sentiment-analysis/turbo.json ./
COPY legal-sentiment-analysis/pnpm-workspace.yaml ./

# Build the Next.js application
RUN pnpm --filter=web build

# Stage 2: Build the Python backend
FROM python:3.10-alpine AS backend_builder

WORKDIR /app/backend

# Copy backend requirements and install dependencies
COPY legal-sentiment-analysis/apps/api/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY legal-sentiment-analysis/apps/api/ ./

# Stage 3: Final image
FROM alpine:latest

WORKDIR /app

# Install necessary packages for running both frontend and backend
# Install Node.js and pnpm for running the Next.js output
# Install Python and pip for running the FastAPI app
# Install tini as an init process
RUN apk add --no-cache nodejs npm python3 py3-pip tini

# Install pnpm globally in the final image
RUN npm install -g pnpm

# Copy built frontend from frontend_builder
COPY --from=frontend_builder /app/frontend/legal-sentiment-analysis/apps/web/.next ./frontend/.next
COPY --from=frontend_builder /app/frontend/legal-sentiment-analysis/apps/web/public ./frontend/public
COPY --from=frontend_builder /app/frontend/legal-sentiment-analysis/apps/web/package.json ./frontend/
RUN mkdir -p ./frontend/node_modules
COPY --from=frontend_builder /app/frontend/legal-sentiment-analysis/node_modules ./frontend/node_modules/

# Copy backend from backend_builder
COPY --from=backend_builder /app/backend/ ./backend/

# Copy the entrypoint script
COPY legal-sentiment-analysis/docker-entrypoint.sh ./

# Make the entrypoint script executable
RUN chmod +x ./docker-entrypoint.sh

# Expose the port the Next.js app will run on (default is 3000)
EXPOSE 3000

# Use tini as the init process and run the entrypoint script
ENTRYPOINT ["/sbin/tini", "--", "./docker-entrypoint.sh"]