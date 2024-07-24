# Base stage
FROM node:lts-alpine AS base

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --network-timeout 1000000

# Build stage for API Gateway
FROM base AS api-gateway
COPY . .
WORKDIR /usr/src/app/apps/api-gateway
RUN yarn build

# Build stage for Deliveries Service
FROM base AS deliveries-service
COPY . .
WORKDIR /usr/src/app/apps/deliveries-service
RUN yarn build

# Build stage for Listings Service
FROM base AS listings-service
COPY . .
WORKDIR /usr/src/app/apps/listings-service
RUN yarn build

# Build stage for Orders Service
FROM base AS orders-service
COPY . .
WORKDIR /usr/src/app/apps/orders-service
RUN yarn build

# Build stage for Users Service
FROM base AS users-service
COPY . .
WORKDIR /usr/src/app/apps/users-service
RUN yarn build

# Final stage
FROM node:lts-alpine AS final

# Set the working directory
WORKDIR /usr/src/app

# Copy the relevant built app from each service stage
COPY --from=api-gateway /usr/src/app/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=deliveries-service /usr/src/app/apps/deliveries-service/dist ./apps/deliveries-service/dist
COPY --from=listings-service /usr/src/app/apps/listings-service/dist ./apps/listings-service/dist
COPY --from=orders-service /usr/src/app/apps/orders-service/dist ./apps/orders-service/dist
COPY --from=users-service /usr/src/app/apps/users-service/dist ./apps/users-service/dist

# Install dependencies for the final stage
COPY package.json yarn.lock ./
RUN yarn install --production --network-timeout 1000000

# Default command (this will be overridden in docker-compose.yml for each service)
CMD [ "node", "dist/main.js" ]
