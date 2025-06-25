# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь остальной код
COPY . .

# The Vite dev server binds to port 5173
EXPOSE 5173

# Keep the container running for development
CMD ["npm", "run", "dev", "--", "--host"] 