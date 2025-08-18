# Use Node.js as the base image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the backend server's port (adjust if your server runs on a different port)
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]