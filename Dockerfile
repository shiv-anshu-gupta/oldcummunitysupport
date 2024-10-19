# Use a base image with Node.js version 16 for better compatibility
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) into the container
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the rest of the application's source code into the container
COPY . .

# Expose the application's port (3001)
EXPOSE 3001

# Run the app using nodemon in development mode or node in production mode
# For simplicity, we'll use 'node' to run the app.
CMD ["node", "server.js"]
