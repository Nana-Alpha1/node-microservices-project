# Use a Node.js base image
FROM node:lts-alpine

# Argument to specify the application name
ARG APP_NAME

# Set the working directory
WORKDIR /usr/src/app

# Copy package and lock files
COPY package.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --network-timeout 1000000

# Copy the entire project
COPY . .

# Clear Nx cache
RUN npx nx reset

# Build the specified app
RUN npx nx build $APP_NAME

# List contents of the dist directory (for debugging)
RUN ls -R dist

# Command to run the specified app
CMD ["node dist/apps/$APP_NAME/main.js"]
