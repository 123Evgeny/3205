# ---- Stage 1: Build ----
# Используем Node.js для сборки приложения
FROM node:20-alpine AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json (или yarn.lock, pnpm-lock.yaml)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код приложения
COPY . .

# Собираем production-версию приложения
RUN npm run build

# ---- Stage 2: Serve ----
# Используем легковесный веб-сервер Nginx для раздачи статики
FROM nginx:1.25-alpine

# Копируем собранные файлы из стадии 'build' в директорию Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем кастомную конфигурацию Nginx
# Этот шаг опционален, но полезен для SPA (Single Page Application)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80, который Nginx слушает по умолчанию
EXPOSE 80

# Команда для запуска Nginx
CMD ["nginx", "-g", "daemon off;"] 