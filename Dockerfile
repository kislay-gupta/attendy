FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files first
COPY src/ ./src/
COPY index.js ./

# Copy public folder
COPY public/ ./public/

# Copy any remaining necessary files
COPY . .

# Set environment variable to use port 3611
ENV PORT=3611

# Expose the port the app runs on
EXPOSE 3611

# Command to run the application
CMD ["node", "index.js"]