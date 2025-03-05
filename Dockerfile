FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variable to use port 3611
ENV PORT=3011

# Expose the port the app runs on
EXPOSE 3011

# Command to run the application
CMD ["node", "index.js"]