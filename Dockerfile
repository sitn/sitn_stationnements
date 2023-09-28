### Compile ###
FROM node:16.10-alpine as builder
WORKDIR /usr/src/app
ENV PATH=${PATH}:./node_modules/.bin
ENV NODE_PATH=/usr/src/app/node_modules
COPY package*.json ./

#Install app dependencies
RUN npm install --loglevel=error --no-audit
COPY . .
RUN vite build

### Run ###
FROM httpd:alpine
RUN rm -r /usr/local/apache2/htdocs/*
COPY --from=builder /usr/src/app/dist/ /usr/local/apache2/htdocs/
COPY ./httpd.conf /usr/local/apache2/conf/
