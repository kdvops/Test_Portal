# Imagen base oficial de Node (ligera)
FROM node:latest

# Establecer directorio de trabajo
WORKDIR /app

# Copiar solo los archivos de dependencias primero (mejor cache)
COPY s/package*.json ./

# Instalar dependencias (solo producción)
#RUN npm ci --only=production
RUN npm install --only=production

# Copiar el resto del código
COPY s/. .

# Exponer el puerto de la app
EXPOSE 3000

# Usuario no root (buena práctica de seguridad)
USER node

# Comando de arranque
CMD ["node", ".output/server/index.mjs"]
