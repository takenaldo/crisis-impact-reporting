FROM ubuntu:24.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /cir-frontend

# Install curl, add the NodeSource repository for Node.js 20, install Node.js, and clean up
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package*.json /cir-frontend/
RUN npm install

# Copy the rest of the frontend code
COPY . /cir-frontend/

EXPOSE 3000

# Use "npm run dev" if you are using Vite instead of Create React App
# CMD ["npm", "start"]