# SSO FRVM — Panel de administración

Panel de administración para el servidor OAuth 2.0 [SSO FRVM](https://github.com/ignamosconi/sso-frvm).

Permite a los administradores gestionar los clientes OAuth registrados y los usuarios con acceso al panel, sin necesidad de interactuar directamente con la API.

---

## Tecnologías

- **React + TypeScript** — biblioteca de UI
- **Vite** — bundler y servidor de desarrollo
- **Mantine** — componentes de UI con soporte nativo de modo claro/oscuro
- **Zustand** — estado global de autenticación
- **Axios** — cliente HTTP
- **React Router** — navegación

---

## Requisitos previos

- Node.js
- El backend [sso-frvm](https://github.com/ignamosconi/sso-frvm) corriendo y accesible

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/ignamosconi/sso-frvm-admin.git
cd sso-frvm-admin

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editá .env y verificá que esté completo
```

### Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_BASE_URL` | URL base del backend SSO FRVM | `http://localhost:3000` |
| `AUTOGESTION_URL` | URL del endpoint público de autogestión UTN FRVM | `https://webservice.frvm.utn.edu.ar/autogestion` |

---

## Desarrollo

```bash
npm run dev
```

El panel queda disponible en `http://localhost:5173`.

---

## Producción

```bash
npm run build
```

El output queda en la carpeta `dist/`. Servila con cualquier servidor estático — nginx, Apache, o el propio NestJS si querés consolidar todo en un mismo servidor.

---

## Funcionalidades

**Autenticación de administradores**
Los administradores tienen credenciales propias, independientes de las credenciales de autogestión UTN. El sistema emite access tokens y refresh tokens con renovación automática.

**Gestión de clientes OAuth**
Registro de apps que pueden usar el SSO, con soporte para múltiples redirect URIs por cliente (hasta 5). El sistema genera automáticamente el `client_secret` al crear un cliente. Desde el panel podés regenerar el secret y enviar las credenciales completas al desarrollador por email, incluyendo instrucciones de integración.

**Gestión de administradores**
Cada admin puede editar únicamente su propio usuario y contraseña. Cualquier admin puede crear nuevos admins o eliminar existentes, con la restricción de que el sistema no permite eliminar el último administrador para evitar quedar sin acceso.

**Dashboard**
Muestra el estado en tiempo real del servidor SSO y del webservice de autogestión de UTN FRVM, con verificación automática cada 30 segundos y botón de retry manual.

**FAQs**
Guía rápida para el personal de la oficina con instrucciones para levantar el sistema, registrar nuevas apps y crear administradores. También incluye una sección para desarrolladores con el flujo de integración completo.
