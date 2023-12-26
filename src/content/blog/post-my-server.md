---
title: "Instalación de mi  Server web con Docker"
description: "Como Monte mi servidor web Con docker"
pubDate: "Dec 26 2023"
heroImage: "/me.webp"
tags: ["Linux","Servers","Docker"]
---

Hola , quiero compartir mi experiencia y los pasos que seguí para instalar Ubuntu Server y configurar Docker junto con Docker Compose. Emplie un Servidor fisico para Correr
todas las aplicaciones web y otros servicios , Adquieriendo un dominio y apuntandolo a este mismo.

## Instalación de Ubuntu Server

1. **Descargar Ubuntu Server:**
   - Lo primero que hice fue visitar el [sitio web oficial de Ubuntu](https://ubuntu.com/download/server) y descargar la versión más reciente de Ubuntu Server.

2. **Crear un medio de instalación:**
   - Grabé la imagen de Ubuntu Server en un USB siguiendo las instrucciones proporcionadas en el sitio web de Ubuntu.

3. **Arrancar desde el medio de instalación:**
   - Inserté el USB en el servidor y configuré la secuencia de arranque en la BIOS para que iniciara desde el medio que creé.

4. **Instalar Ubuntu Server:**
   - Seguí las instrucciones en pantalla para personalizar mi instalación, estableciendo el nombre de usuario, contraseña y otras preferencias.

5. **Actualizar el sistema:**
   - Después de la instalación, ejecuté los siguientes comandos para asegurarme de que mi sistema estuviera actualizado:

   ```bash
   sudo apt update
   sudo apt upgrade
   ```
6. **Instalar Docker Engine y Docker Compose:**
   - Actualicé el índice de paquetes e instalé Docker y Docker Compose:

   ```bash
   sudo apt update
   sudo apt install docker-ce docker-compose
   ```

5. **Verificar la instalación de Docker:**
   - Aseguré que Docker y Docker Compose se instalaron correctamente:

   ```bash
   sudo docker --version
   docker-compose --version
   ```

   Verifiqué las versiones para asegurarme de que todo estaba en orden.

6. **Verificar el estado de Docker:**
   - Comprobé que Docker estaba en ejecución con:

   ```bash
   sudo systemctl status docker
   ```

   Verifiqué que Docker estuviera activo y funcionando.

7. **Agregar el usuario al grupo Docker:**
   - Para ejecutar comandos Docker sin `sudo`, me añadí al grupo Docker y reinicié la sesión:

   ```bash
   sudo usermod -aG docker $USER
   su - $USER
   groups
   ```

   Aseguré que el grupo "docker" apareciera en la lista, indicando que tenía permisos para ejecutar comandos Docker sin sudo.

¡Listo! Ahora tengo un sistema Ubuntu Server con Docker y Docker Compose instalados y listos para usar. 

## Instalación de WEB Server con php7.4 + nginx + sqlsrv Server con SSL

Principalmente uso un Stack con Laravel 7 y mysql 5.7 , me di a la tarea de prepara un docker compose para que dentro del servidor
se corran todos estos contenedores y asi estanderizar mi Ambiente de desarrollo como el de produccion, este es el docker compose que use: 

```yaml
version: "3.7"
services:

  # Servicio para la aplicación web (PHP + Nginx + Sqlsrv)
  web-app-my:
    container_name: cn_app-my
    image: kooldev/php:7.4-nginx-sqlsrv-prod
    restart: always
    volumes:
      - "./www/MYAPP:/app/MYAPP"
      - "./default.tmpl:/kool/default.tmpl"
    ports:
      - "80:80"
    environment:
      # Variables de entorno para la aplicación
      - APP_NAME=MYAPP
      - PHP_FPM_LISTEN=/run/php-fpm.sock
      - NGINX_LISTEN=80
      - NGINX_ROOT=/app/MYAPP/public
      - NGINX_INDEX=index.php
      - NGINX_CLIENT_MAX_BODY_SIZE=25M
      - NGINX_PHP_FPM=unix:/run/php-fpm.sock
      - NGINX_FASTCGI_READ_TIMEOUT=60s
      - NGINX_FASTCGI_BUFFERS=8 8k
      - NGINX_FASTCGI_BUFFER_SIZE=16k

  # Servicio para la base de datos MySQL
  mysql_master:
    image: mysql:5.7
    container_name: "mysql_master"
    environment:
      # Configuración de la base de datos
      MYSQL_ROOT_HOST: "%"
      MYSQL_ROOT_PASSWORD: ${PZW_ROOT}
      MYSQL_PORT: ${myPORT}
      MYSQL_USER: ${MYSQL_USER_MST}
      MYSQL_PASSWORD: ${MYSQL_PASS_MST}
      MYSQL_LOWER_CASE_TABLE_NAMES: 0
    restart: always
    ports:
      - 4406:3306
    volumes:
      # Volumenes para persistencia de datos y configuración
      - ./master/conf/mysql.conf.cnf:/etc/mysql/conf.d/mysql.conf.cnf
      - ./master/data:/var/lib/mysql
      - ./master/logs:/var/log/mysql
      - ./initdb/initdb.sql:/docker-entrypoint-initdb.d/initdb.sql
    healthcheck:
      # Verificación de salud de MySQL
      test: [ "CMD", "mysqladmin", "ping", "-h", "localhost" ]
      interval: 30s
      timeout: 20s
      retries: 10
      start_period: 30s

  # Servicio para realizar copias de seguridad de MySQL
  mysql-cron-backup:
    image: fradelg/mysql-cron-backup
    container_name : cn_mysql-cron-restore
    depends_on:
      - mysql_master
    volumes:
      - ./BackUp:/backup
    environment:
      # Configuración para el servicio de respaldo
      - MYSQL_HOST=${IP_SERVER}
      - MYSQL_PORT=${myPORT}
      - MYSQL_USER=root
      - MYSQL_PASS=${PZW_ROOT} 

  # Servicio para realizar copias de seguridad en Google Drive usando rclone
  rclone-gdrive:
    image: pfidr/rclone
    container_name: cn_cron-rclone-gdrive
    restart: always
    volumes:
      # Configuración y almacenamiento de copias de seguridad
      - ./rclone:/config
      - ./BackUp:/gdrive
    environment:
      # Configuración de rclone para Google Drive
      - PUID=1000
      - PGID=1000
      - "RCLONE_CMD=sync"
      - "TZ=America/Managua"
      - "SYNC_SRC=/gdrive"
      - "SYNC_DEST=gdrive:"
      - "CRON=21 23 * * *" 
      - "FORCE_SYNC=1"
      - "SYNC_OPTS=-v"
      - "CHECK_URL=https://hc-ping.com/9cd1591a-bedb-4155-95a7-527179bfd777"

volumes:
  # Volumen para datos persistentes de MySQL
  mysql-data:
```

Como les muestro defino tres Contenedores: `web-app-my` para la aplicación web en general ,, `mysql_master` para la base de datos MySQL en su version 5.7, y `mysql-cron-backup` para realizar copias de seguridad de MySQL . También hay un servicio adicional `rclone-gdrive` para realizar copias de seguridad en Google Drive utilizando rclone. Se utilizan variables de entorno para configurar los servicios y se definen volúmenes para persistencia de datos. Además, se especifica un cronjob para realizar sincronizaciones periódicas con Google .

Y el contenido del archivo `.env`:

```env
PZW_ROOT=Aqui-tu_passWord-UwU
myPORT=3306
IP_SERVER=192.168.0.0

MYSQL_USER_MST=usr_d3l_m@st3r
MYSQL_PASS_MST=pzw_d3l_m@st3r
```

En este archivo `.env`, se definen las variables de entorno que se utilizan en el archivo `docker-compose.yml`, facilitando la gestión de configuraciones y secretos.


Igualmente al Contenedor de las aplicaciones les paso un archivo, que recibe las variables y configura a nginx , el archivo `default.tmpl` que quedaria asi:

```env
server {
    listen {{ .Env.NGINX_LISTEN }} default_server;
    server_name _;
    root {{ .Env.NGINX_ROOT }};
    index {{ .Env.NGINX_INDEX }};
    charset utf-8;
    
    location = /favicon.ico { log_not_found off; access_log off; }
    location = /robots.txt  { log_not_found off; access_log off; }

    client_max_body_size {{ .Env.NGINX_CLIENT_MAX_BODY_SIZE }};

    error_page 404 /index.php;

    location / {
        try_files $uri $uri/ /{{ .Env.NGINX_INDEX }}?$query_string;
        add_header X-Served-By kool.dev;
    }

    location /{{ .Env.APP_NAME }} {
        alias {{ .Env.NGINX_ROOT }};
        try_files $uri $uri/ @{{ .Env.APP_NAME }};

        location ~ \.php$ {
            fastcgi_pass {{ .Env.NGINX_PHP_FPM }};
            fastcgi_param SCRIPT_FILENAME $request_filename;
            include fastcgi_params;
        }
    }

    location @{{ .Env.APP_NAME }} {
        rewrite /{{ .Env.APP_NAME }}/(.*)$ /{{ .Env.APP_NAME }}/index.php?/$1 last;
    }

    location ~ \.php$ {
        fastcgi_buffers {{ .Env.NGINX_FASTCGI_BUFFERS }};
        fastcgi_buffer_size {{ .Env.NGINX_FASTCGI_BUFFER_SIZE }};
        fastcgi_pass {{ .Env.NGINX_PHP_FPM }};
        fastcgi_read_timeout {{ .Env.NGINX_FASTCGI_READ_TIMEOUT }};
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}

```


Y ya estaria , con todos estos archivos ya configurados correctamente, deberia de andar, les dejo por aqui
las referencia de la documentacion de la imagen que uso para las aplicaciones.

**Referencia:** [Repositorio de Docker PHP por kool-dev](https://github.com/kool-dev/docker-php)

Ahora queria tener SSL y lei que con letsencrypt y nginx se podia tener, me di a la tarea de usarlo, con lo que llegue a usar
Nginx Proxy Manager y asi manejar varios dominio y que los certificados se Renueve automaticamente, aqui les comparto el que use:

```yaml
version: '3'
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    container_name: cn_nginx-proxy-manage 
    ports:
      - '80:80'
      - '81:81'
      - '443:443'
    volumes:
      - ./config.json:/app/config/production.json
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
  db:
    image: 'jc21/mariadb-aria:10.4.15'
    container_name: cn_mariadb-nginx
    environment:
      MYSQL_ROOT_PASSWORD: 'npm'
      MYSQL_DATABASE: 'npm'
      MYSQL_USER: 'npm'
      MYSQL_PASSWORD: 'npm'
    volumes:
      - ./data/mysql:/var/lib/mysql
```

Y el contenido del archivo `.config.json`:
```
{
  "database": {
    "engine": "mysql",
    "host": "db",
    "name": "npm",
    "user": "npm",
    "password": "npm",
    "port": 3306
  }
}
```

y con esto tendria ya el contenedor de los certificados corriendo.

por ultimo pero esto ya varia dependiendo del proveedor  porque yo me pille el dominio , apunete el DNS a este Serverde Y listo ya tengo sitio WEB.


pero como nunca paro de aprender , me monte MINIO Object Store en Docker 
pero Coming soon ... 