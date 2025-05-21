# Étape 1 : Build de l'app React
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers
COPY package*.json ./
RUN npm install

COPY . .
# Injecter la variable d'API au build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Étape 2 : Servir avec Nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Copier une config Nginx custom si besoin (ex: pour React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]