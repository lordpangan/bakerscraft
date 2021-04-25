FROM node:alpine

WORKDIR /app
COPY package.json .
COPY .npmrc .
RUN npm install --only=prod
COPY . .

CMD ["npm","start"]