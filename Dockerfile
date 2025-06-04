# syntax = docker.io/docker/dockerfile:experimental
FROM fullpipe/node:lts AS build

ARG environment=production

# Set the working directory
WORKDIR /app

# Add the source code to app
COPY package* .
RUN npm ci

COPY . .

# Generate the build of the application
RUN npm run build -- --configuration=production

FROM fullpipe/web-app:latest AS release
COPY --from=build /app/www /app
