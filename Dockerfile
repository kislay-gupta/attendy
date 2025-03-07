FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all application files
COPY . .

# Set environment variable to use port 3611
ENV PORT=3611

# Expose the port the app runs on
EXPOSE 3611

# Command to run the application
CMD ["node", "index.js"]