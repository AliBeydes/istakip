FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy prisma files
COPY prisma ./prisma/

# Copy source code
COPY src ./src

# Generate Prisma Client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3020

# Start the application
CMD ["node", "src/index.js"]
