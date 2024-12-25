
FROM mysql/mysql-server:8.0.23

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /var/lib/mysql

# Copiar el archivo dump.sql para inicializar la base de datos
COPY dump.sql /docker-entrypoint-initdb.d/

# Exponer el puerto del MySQL
EXPOSE 3307

# Configuración inicial de MySQL
ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=litheboard_db
ENV MYSQL_USER=litheboard_user
ENV MYSQL_PASSWORD=securepassword

# Entrar al contenedor y ejecutarlo
CMD ["mysqld"]
