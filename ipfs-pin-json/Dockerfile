FROM node:20-alpine3.20

WORKDIR /usr/src/app

COPY ./package*.json ./
COPY index.js ./

RUN apk --no-cache add curl

RUN npm install

EXPOSE 80

CMD ["npm","start"]