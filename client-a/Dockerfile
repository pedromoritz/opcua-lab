FROM node:14.15.0-alpine3.12
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add --no-cache openssl
RUN npm install
COPY app.js .
CMD [ "node", "app.js" ]