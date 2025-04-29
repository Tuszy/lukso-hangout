FROM node:20-alpine3.20

WORKDIR /usr/src/app

COPY ./package*.json ./
RUN npm install
COPY .env ./
COPY ./src ./src

CMD ["npm","start"]