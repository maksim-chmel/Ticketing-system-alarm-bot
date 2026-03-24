FROM node:20-alpine

WORKDIR /app


COPY package*.json ./
RUN npm install


COPY . .


RUN npm install -g ts-node typescript


RUN ls -la .env


CMD ["npx", "ts-node", "src/index.ts"]