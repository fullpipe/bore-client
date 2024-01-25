# syntax = docker.io/docker/dockerfile:experimental

# Use official node image as the base image
FROM node:lts-slim as build

ARG environment=production

# Set the working directory
WORKDIR /app

# Add the source code to app
COPY package* .
RUN npm ci

COPY . .

# Generate the build of the application
RUN npm run build -- --configuration=production

FROM caddy:alpine as release

EXPOSE 8080
COPY  Caddyfile /etc/caddy/Caddyfile

COPY --from=build /app/www /app
