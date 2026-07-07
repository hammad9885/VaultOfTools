FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci --only=production --ignore-scripts || npm install

COPY . .

EXPOSE 3000

ENV NODE_ENV=development
CMD ["npm", "run", "dev"]
