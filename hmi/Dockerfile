FROM node:10.22.1-alpine3.11
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add --no-cache openssl
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "app.js" ]