# Dockerfile para mail-sender
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3015
CMD ["node", "server.js"]
