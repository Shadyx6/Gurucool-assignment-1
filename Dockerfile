# Use the official Node.js image
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the app
CMD ["node", "app.js"]
