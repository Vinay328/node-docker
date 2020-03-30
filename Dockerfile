FROM node:alpine

WORKDIR /usr/src/node-docker

COPY . .

RUN npm install

EXPOSE 8080

CMD ["node", "app/index.js"]

