### Compile ###
# Select base image with Node.js preinstalled (official Node.js Alpine Linux image for v16.x)
FROM node:22-alpine AS builder
# Define working directory in the Docker image to /usr/src/app
WORKDIR /usr/src/app

# Set path to node modules
# ENV PATH=${PATH}:./node_modules/.bin
# ENV NODE_PATH=/usr/src/app/node_modules

# Copy package.json and package-lock.json to the /usr/src/app directory
COPY package.json package-lock.json ./

# Install app dependencies
RUN npm ci --loglevel=error --no-audit

# Copy the rest of project files into the Docker image
COPY . .

# Build app with vite (will create "/usr/src/app/dist/" directory)
RUN npm run build

### Run apache server ###
FROM httpd:alpine

RUN rm -rf /usr/local/apache2/htdocs/*
COPY --from=builder /usr/src/app/dist/ /usr/local/apache2/htdocs/
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf

# RUN rm -r /usr/local/apache2/htdocs/*
# COPY --from=builder /usr/src/app/dist/ /usr/local/apache2/htdocs/
# COPY ./httpd.conf /usr/local/apache2/conf/
