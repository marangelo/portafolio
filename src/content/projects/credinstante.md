---
title: "Credinstante"
description: "Manages the portfolio of loans and the corresponding payments applied to these loans."
pubDate: "Nov 20 2023"
heroImage: "/app-01.png"
badge: "New"
tags: ['HTML', 'BOOSTRAP', 'LARAVEL','MYSQL','DOCKER']
---
Este Proyecto describe la arquitectura de una aplicación web desplegada en un servidor VPS de Hetzner. 

### **Tecnología usada**
- PHP 7.4
- Laravel 7 MVC
- Mysql 5.7
- Docker RCLONE
- DOCKER MYSQL BACKUP

### Componentes principales

* **Smarterasp.net:** Gestiona los registros DNS, apuntando los dominios  
    `https://credinstantes.com`, `https://app.credinstantes.com` y `https://dev.credinstantes.com` al servidor VPS.
* **Hetzner VPS:** Servidor virtual privado que aloja la aplicación y sus dependencias.
   * **Recursos:** El VPS cuenta con 2 CPUs, 8GB de RAM, 80GB de almacenamiento y 20TB de tráfico mensual.
   * **Docker:** Se utiliza Docker para contenerizar la aplicación y sus servicios. 
   * **Nginx Proxy Manager:** Actúa como un proxy inverso y balanceador de carga para las aplicaciones.
   * **Aplicaciones:** 
      * **App Pro:** La aplicación principal.
      * **App Dev:** Una versión de desarrollo de la aplicación.
      * **Sitio HTML:**  Un sitio web estático. 
   * **Base de datos:** Se utiliza MySQL como sistema de gestión de bases de datos.
   * **Respaldos:** Se realizan respaldos locales diarios y se suben automáticamente a Google Drive mediante un contenedor dedicado. 



### Flujo del tráfico

1. El usuario accede a la aplicación a través de uno de los dominios configurados.
2. Smarterasp.net DNS dirige la solicitud al servidor VPS.
3. Nginx Proxy Manager recibe la solicitud y la redirige al contenedor apropiado según la configuración. 
4. La aplicación procesa la solicitud y accede a la base de datos MySQL si es necesario.
5. La respuesta se envía de vuelta al usuario a través de Nginx Proxy Manager. 

### Notas adicionales

* El puerto 80 de la aplicación solo es accesible dentro del contenedor, lo que aumenta la seguridad. 
* Se ha agregado la IP pública del VPS a los registros DNS tipo A para que los dominios apunten correctamente al servidor. 
* Se utiliza un proxy para gestionar el tráfico de manera que solo se use la red local del servidor, evitando que el tráfico pase por internet. 
* **Exposición de puertos:** Solo se exponen a internet los puertos estrictamente necesarios para el funcionamiento de las aplicaciónes.


## Screenshots

![App Screenshot](https://github.com/marangelo/Server-Credinstante/raw/master/draw.png)

## GitHub
- puede mirar (https://github.com/marangelo/Server-Credinstante)

