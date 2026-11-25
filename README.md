# ReservasAPI

API REST para la gestión de reservas de espacios, desarrollada en el curso **Programación V – Backend** (UNIAJC).

Integrantes: Jarol Palechor, Jhovanny y Anderson.

## Tecnologías

| Componente | Tecnología |
|---|---|
| Lenguaje | TypeScript |
| Servidor | Express 5 |
| ORM | Prisma 6 |
| Base de datos | PostgreSQL (Docker) |
| Autenticación | JWT (`jsonwebtoken`) |
| Cifrado de contraseñas | `bcryptjs` |
| Ejecución en desarrollo | `tsx watch` |
| Pruebas | Postman y PowerShell |

## Estructura del proyecto

```
reservas-api/
├── prisma/
│   ├── schema.prisma          Modelos User y Space, enum Role
│   └── migrations/            Historial de migraciones
├── src/
│   ├── controllers/           Manejo de la petición y la respuesta HTTP
│   ├── services/              Lógica de negocio y acceso a datos con Prisma
│   ├── routes/                Definición de endpoints
│   ├── middlewares/           Autenticación (JWT) y autorización por rol
│   ├── types/                 Tipos propios (usuario autenticado en la request)
│   └── index.ts               Punto de entrada del servidor
├── docs/
│   └── postman/               Colección de Postman con las pruebas
├── crear-admin.cjs            Crea el usuario administrador de pruebas
├── crear-owners.cjs           Crea los dos propietarios de pruebas
├── docker-compose.yml         PostgreSQL 16 en Docker
└── .env.example               Plantilla de variables de entorno
```

## Instalación y ejecución

### 1. Instalar dependencias

```powershell
npm install
```

### 2. Variables de entorno

Copiar la plantilla y reemplazar los valores (el archivo `.env` no se sube al repositorio):

```powershell
Copy-Item .env.example .env
notepad .env
```

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Cadena de conexión a PostgreSQL que usa Prisma |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Solo con Docker | Credenciales con las que se crea el contenedor de PostgreSQL |
| `PORT` | No | Puerto de la API. Por defecto `3000` |
| `JWT_SECRET` | Sí | Clave con la que se firman y validan los tokens |
| `JWT_EXPIRES_IN` | No | Vigencia del token. Por defecto `8h` |

### 3. Base de datos

La API necesita PostgreSQL 16 con una base llamada `reservas`. Hay dos formas de tenerla.

**Opción A: PostgreSQL instalado en Windows.** Crear la base `reservas` (por ejemplo, desde pgAdmin) y usar el puerto 5432 en `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:CLAVE@localhost:5432/reservas?schema=public"
```

**Opción B: Docker.** Con Docker Desktop abierto:

```powershell
docker compose up -d
```

El contenedor se publica en el puerto **5433**, para no chocar con un PostgreSQL local. En ese caso `DATABASE_URL` debe usar ese puerto y las mismas credenciales de `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB`:

```env
DATABASE_URL="postgresql://postgres:CLAVE@localhost:5433/reservas?schema=public"
```

Los datos del contenedor quedan en el volumen `reservas-data`, así que no se pierden al detenerlo. Para detenerlo: `docker compose down`.

### 4. Aplicar migraciones y generar el cliente de Prisma

```powershell
npx prisma migrate dev
npx prisma generate
```

### 5. Crear los usuarios de prueba

```powershell
node crear-admin.cjs
node crear-owners.cjs
```

### 6. Iniciar la API

```powershell
npm run dev
```

La API queda disponible en `http://localhost:3000`. Para verificar que está arriba:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

Respuesta esperada: `{ "status": "ok" }`.

### Scripts disponibles

| Script | Uso |
|---|---|
| `npm run dev` | Inicia el servidor en modo desarrollo y lo reinicia al guardar cambios |
| `npm run build` | Compila TypeScript a la carpeta `dist/` |
| `npm start` | Ejecuta la versión compilada |

## Modelo de datos

### Roles

| Rol | Descripción |
|---|---|
| `ADMIN` | Administra todos los espacios del sistema |
| `OWNER` | Propietario: crea espacios y gestiona solo los suyos |
| `CLIENT` | Cliente: consulta espacios. Es el rol por defecto al registrarse |

### User

| Campo | Tipo | Observación |
|---|---|---|
| `id` | Int | Autoincremental |
| `name` | String | |
| `email` | String | Único |
| `password` | String | Se guarda cifrada con bcrypt, nunca en texto plano |
| `role` | Role | Por defecto `CLIENT` |
| `createdAt` | DateTime | Fecha de creación |

### Space

| Campo | Tipo | Observación |
|---|---|---|
| `id` | Int | Autoincremental |
| `name` | String | Único |
| `capacity` | Int | |
| `location` | String | |
| `type` | String | |
| `ownerId` | Int | Usuario propietario. No se puede eliminar un usuario que tenga espacios (`onDelete: Restrict`) |

## Autenticación

### Registrar usuario

`POST /api/auth/register`

```json
{
    "name": "Cliente Prueba",
    "email": "cliente@reservas.com",
    "password": "ClientePrueba123*"
}
```

- El nombre, el correo y la contraseña son obligatorios, y la contraseña debe tener al menos 8 caracteres.
- El usuario registrado queda siempre con rol `CLIENT`. El rol no se recibe en el body, para que nadie pueda registrarse como administrador.
- Si el correo ya existe, responde `409`.

### Iniciar sesión

`POST /api/auth/login`

```json
{
    "email": "admin@reservas.com",
    "password": "Admin123*"
}
```

Respuesta:

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "name": "Administrador",
        "email": "admin@reservas.com",
        "role": "ADMIN"
    }
}
```

El token lleva el `id` y el `role` del usuario y tiene una vigencia de 8 horas, configurable con `JWT_EXPIRES_IN`. Se envía en las rutas protegidas con el encabezado:

```
Authorization: Bearer TOKEN
```

## Endpoints de espacios

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/spaces` | Consultar todos los espacios | Público |
| GET | `/api/spaces/:id` | Consultar un espacio por ID | Público |
| GET | `/api/spaces/mios` | Consultar los espacios del usuario autenticado | Cualquier usuario autenticado |
| POST | `/api/spaces` | Crear un espacio | `OWNER`, `ADMIN` |
| PUT | `/api/spaces/:id` | Actualizar un espacio | `OWNER` (solo los propios), `ADMIN` |
| DELETE | `/api/spaces/:id` | Eliminar un espacio | `ADMIN` |

### Reglas de autorización

1. **Autenticación (`requireAuth`)**: valida el token JWT. Si falta o no es válido, responde `401`.
2. **Rol (`requireRole`)**: verifica que el rol del usuario esté permitido en la ruta. Si no lo está, responde `403`.
3. **Propietario**: al crear un espacio, el `ownerId` se toma del usuario autenticado, no del body. Al actualizar, un `OWNER` solo puede modificar los espacios cuyo `ownerId` coincida con su `id`; si intenta modificar uno ajeno, responde `403`. El `ADMIN` puede modificar cualquiera.

## Códigos de respuesta

| Código | Significado en esta API |
|---|---|
| `200` | Operación correcta |
| `201` | Recurso creado (registro de usuario o espacio) |
| `204` | Espacio eliminado |
| `400` | Datos incompletos o inválidos |
| `401` | No autenticado: falta el token o no es válido |
| `403` | Autenticado, pero sin permiso para la operación |
| `404` | El espacio no existe |
| `409` | Conflicto: correo o nombre de espacio ya registrado |

## Usuarios de prueba

Solo para el entorno local de desarrollo. Estas contraseñas no se deben usar en producción.

| Rol | Correo | Contraseña | Cómo se crea |
|---|---|---|---|
| ADMIN | admin@reservas.com | Admin123* | `node crear-admin.cjs` |
| OWNER | owner1@reservas.com | OwnerPrueba123* | `node crear-owners.cjs` |
| OWNER | owner2@reservas.com | OwnerPrueba123* | `node crear-owners.cjs` |
| CLIENT | cliente@reservas.com | ClientePrueba123* | `POST /api/auth/register` |

## Pruebas con Postman

La colección está en `docs/postman/ReservasAPI.postman_collection.json`.

### Importar

En Postman: **Import** → seleccionar el archivo. La colección trae la variable `baseUrl` con el valor `http://localhost:3000`.

### Organización

| Carpeta | Contenido |
|---|---|
| Autenticación | Login de los cuatro usuarios y registro del cliente. Cada login guarda su token en una variable (`tokenAdmin`, `tokenOwner1`, `tokenOwner2`, `tokenCliente`) |
| Datos iniciales | Creación de un espacio para cada propietario. Se ejecuta una sola vez sobre una base nueva |
| Preparación | Consulta de `/api/spaces/mios` de cada propietario y guardado de sus ID en `idEspacioOwner1` e `idEspacioOwner2` |
| Pruebas de permisos | Las nueve pruebas de autorización |

### Pruebas de permisos

| # | Prueba | Esperado |
|---|---|---|
| 01 | Crear espacio sin token | 401 |
| 02 | CLIENT intenta crear un espacio | 403 |
| 03 | OWNER 1 edita su propio espacio | 200 |
| 04 | OWNER 1 edita el espacio de OWNER 2 | 403 |
| 05 | ADMIN edita el espacio de OWNER 2 | 200 |
| 06 | OWNER 1 intenta eliminar su espacio | 403 |
| 07 | CLIENT intenta eliminar un espacio | 403 |
| 08 | ADMIN crea un espacio temporal | 201 |
| 09 | ADMIN elimina el espacio temporal | 204 |

Las pruebas 08 y 09 van juntas: el administrador elimina un espacio que él mismo crea, para no borrar los espacios que usan las demás pruebas. Así la colección se puede ejecutar completa las veces que se necesite.

### Ejecutar toda la colección

1. Con la API corriendo, abrir la colección y hacer clic en **Run**.
2. Desmarcar la carpeta **Datos iniciales** y la solicitud **Registrar CLIENTE**, que ya se ejecutaron y responderían `409`.
3. Dejar marcada la opción **Keep variable values**, para que los tokens de los logins queden disponibles en las pruebas.
4. Clic en **Run Reservas API**.

Resultado obtenido: **19 pruebas, 19 aprobadas, 0 fallidas**.

## Pruebas con PowerShell

Las mismas validaciones se pueden hacer con `Invoke-RestMethod`.

Iniciar sesión y guardar el token:

```powershell
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/auth/login -ContentType 'application/json' -Body '{"email":"owner1@reservas.com","password":"OwnerPrueba123*"}'
$token = $login.token
```

Consultar los espacios propios:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/spaces/mios -Headers @{ Authorization = "Bearer $token" }
```

Crear un espacio:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/spaces -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body '{"name":"Sala Ejemplo","capacity":10,"location":"Bloque B","type":"aula"}'
```

Cuando la API responde un código de error (`401`, `403`, `404`, `409`), PowerShell lo muestra como una excepción en rojo; el mensaje de la API aparece dentro del texto del error.
