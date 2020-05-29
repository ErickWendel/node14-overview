FROM node:14-alpine

ADD . /src 

COPY package.json package-lock.json /src/

WORKDIR /src

RUN npm ci --silent

CMD npm test && npm start

