# Use an official Node.js runtime as a parent image
FROM node:20-alpine

WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь остальной код
COPY . .

# Устанавливаем NestJS CLI (на всякий случай, если понадобится в будущем)
RUN npm install -g @nestjs/cli

# The app binds to port 3000, so we expose it
EXPOSE 3000

# Keep the container running for development
CMD ["npm", "run", "start:dev"] 