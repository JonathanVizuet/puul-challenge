# Puul Back-End Challenge API

API REST para gestión de tareas de equipo. Desarrollada con NestJS + TypeScript + TypeORM + PostgreSQL.

---

La documentación completa (Análisis, Arquitectura y documentación técnica) 
se encuentra en: https://www.notion.so/Challenge-Back-End-Puul-30e83ffea94880d1abb6c976d1bc82e0?source=copy_link

## Requisitos previos

Se necesita la instalación de:

1. Node.js
2. PostgreSQL 

---

## Instalación:

### 1. Instalar dependencias del proyecto
Dentro de la carpeta del proyecto:
npm install

### 2. Crear la base de datos en PostgreSQL
psql -U postgres

# Dentro de psql, crear la base de datos:
CREATE DATABASE puul_db;

# Salir de psql
\q

### 3. Configurar variables de entorno:

Dentro del proyecto se puede encontrar un ejemplo (.env.example) de cómo debe de 
verse el .env con los datos para la conexión correcta a la DB

### 4. Levantar el servidor de desarrollo
npm run start:dev
