FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=80 SOCKET_PORT=3000

EXPOSE 80 3000

CMD ["npm", "start"]