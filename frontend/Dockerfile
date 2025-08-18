# Use Node.js as the base image for building
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Build the frontend
COPY . .
RUN npm run build

# Use nginx to serve the built frontend
FROM nginx:alpine

# Copy build output to Nginx HTML directory
COPY --from=0 /usr/src/app/build /usr/share/nginx/html

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for serving the app
EXPOSE 80