# Usa una imagen base de Node.js
FROM node:20-alpine

# Establece el directorio de trabajo
WORKDIR /app/backend

# Copia los archivos necesarios
COPY package*.json .
RUN npm install

# Copia el resto del código
COPY . .

# Expone el puerto del frontend
EXPOSE 3001 3007

# Inicia la aplicación
CMD ["npm", "start"]