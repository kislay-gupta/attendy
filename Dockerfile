FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all application files
COPY . .

# Ensure the public directory exists
RUN mkdir -p public && ls -lah public

# Build the application if needed (for frontend apps)
# RUN npm run build 

# Final stage
FROM node:18-alpine

WORKDIR /app

# Copy dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app ./

# Set environment variable
ENV PORT=3611

# Expose the application port
EXPOSE 3611

# Command to run the application
CMD ["node", "index.js"]
