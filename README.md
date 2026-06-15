# Gestión de Pericias Informáticas

Este es un proyecto Fullstack para la gestión de pericias informáticas. Está dividido en dos partes principales: un **Backend** desarrollado en Node.js con Express, y un **Frontend** desarrollado en React usando Vite y Shadcn/ui.

## 📁 Arquitectura del Proyecto

Al clonar este proyecto verás dos carpetas principales:

- `/backend`: Contiene toda la lógica del servidor (API REST), conexión a Supabase y la documentación (Swagger).
- `/frontend`: Contiene la aplicación web desarrollada en React, estilizada con Tailwind CSS y componentes de Shadcn/ui.

---

## 🚀 Manual de Instalación

Para ejecutar este proyecto de forma local en tu computadora, sigue estos pasos:

### Prerrequisitos
Asegúrate de tener instalado en tu computadora:
- [Node.js](https://nodejs.org/es/) (v18 o superior).
- Git.

### 1. Clonar el Repositorio
```bash
git clone https://github.com/evelinnn19/gestion-pericias-informaticas.git
cd gestion-pericias-informaticas
```

### 2. Configurar y Ejecutar el Backend

1. Abre una terminal y muévete a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo llamado `.env` en la carpeta `backend` basándote en la configuración necesaria para conectarse a la base de datos de Supabase. El archivo debe verse así:
   ```env
   PORT=3000
   VITE_SUPABASE_URL=tu_url_de_supabase_aqui
   VITE_SUPABASE_KEY=tu_key_de_supabase_aqui
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   El backend estará corriendo en `http://localhost:3000`.
   Para visualizar y probar la **documentación de la API (Swagger)**, ingresa a `http://localhost:3000/api-docs`.

### 3. Configurar y Ejecutar el Frontend

1. Abre **otra terminal** y muévete a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo del frontend:
   ```bash
   npm run dev
   ```
   El frontend estará corriendo (normalmente) en `http://localhost:5173`. Abre ese enlace en tu navegador.

---

## 🛠 Stack Tecnológico

**Backend:**
- Node.js + Express
- Supabase (Base de datos PostgreSQL + Auth)
- Swagger (Documentación de API)
- Nodemon (Hot-reloading en desarrollo)

**Frontend:**
- React 19 + Vite
- Tailwind CSS v3
- Shadcn/ui (Componentes de interfaz accesibles y personalizables)

## 📌 Control de Versiones

Se ha configurado un `.gitignore` completo en la raíz del proyecto. Este archivo asegura que:
- Las carpetas pesadas como `node_modules` no se suban al repositorio.
- Los archivos `.env` o configuraciones locales no se compartan, protegiendo así tus contraseñas y claves de API (como las de Supabase).
- Archivos generados temporalmente por el editor (como `.vscode/`) queden fuera del seguimiento de Git.
