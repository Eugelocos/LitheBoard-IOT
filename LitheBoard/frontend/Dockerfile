# Usa una imagen base de Node.js
FROM node:20-alpine

RUN apk add --no-cache curl

# Establece el directorio de trabajo
WORKDIR /app/frontend

# Copia los archivos necesarios
COPY package*.json .
RUN npm install
 
# Copia el resto del código
COPY . .

# Expone el puerto del frontend
EXPOSE 3000

# Inicia la aplicación
CMD ["npm", "start"]