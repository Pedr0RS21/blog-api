# API de Blog

Esta es una API RESTful robusta para la gestión de un blog, construida con Node.js, Express y TypeORM. La API permite operaciones CRUD completas para posts, comentarios, usuarios y roles, con un sistema de autenticación basado en JWT y autorización granular por privilegios.

## Características Principales

  * Gestión de Usuarios: Creación (registro), edición, inactivación y listado de usuarios.
  * Autenticación: Sistema de inicio de sesión (login) basado en JWT (Bearer Token).
  * Gestión de Roles y Privilegios: Creación de roles (ej. "Admin", "Editor") y asignación dinámica de privilegios específicos (ej. "AGREGAR\_POST", "ELIMINAR\_COMENTARIO") a cada rol.
  * Asignación de Roles a Usuarios: Los usuarios pueden tener múltiples roles.
  * Gestión de Posts: Operaciones CRUD completas para artículos del blog.
  * Gestión de Comentarios: Operaciones CRUD para comentarios, anidados dentro de los posts.
  * Validación de Entradas: Uso de express-validator para validar todos los datos de entrada (body, params) en las rutas.
  * Seguridad: Rutas protegidas que requieren autenticación y privilegios específicos.

## Stack Tecnológico

  * Backend: Node.js, Express
  * Lenguaje: TypeScript
  * ORM: TypeORM (para interactuar con la base de datos, ej. PostgreSQL, MySQL)
  * Autenticación: JSON Web Tokens (JWT)
  * Validación: express-validator

## Instalación y Configuración

1.  Clonar el repositorio:
    `git clone https://github.com/Pedr0RS21/blog-api.git`
    `cd tu-repositorio`

2.  Instalar dependencias:
    `npm install`

3.  Configurar variables de entorno:
    Crea un archivo `.env` en la raíz del proyecto y añade las configuraciones necesarias, especialmente para la base de datos (TypeORM) y el secreto de JWT.

    ```env
    BD_HOST=localhost
    BD_NOMBRE=blog_api
    BD_USUARIO=root
    BD_PASSWORD=your_secure_password_here

    # Test Database
    BDTEST_HOST=localhost
    BDTEST_NOMBRE=blog_api_test
    BDTEST_USUARIO=root
    BDTEST_CONTRASENA=your_test_password_here

    # Frontend
    FRONTEND_URL=http://localhost:8083

    # JWT Secret (cambiar en producción)
    JWT_SECRET=your_jwt_secret_key_here

    # Environment
    NODE_ENV=development

    # Database Config
    DB_TYPE=mariadb
    DB_PORT=3306

    # Bcrypt
    BCRYPT_SALT_ROUNDS=10
    ```

4.  Sincronizar la Base de Datos:
    Asegúrate de que tu base de datos esté corriendo. TypeORM (basado en tus entidades `Post.ts`, `Comment.ts`, `User.ts`, `Role.ts`) manejará la estructura de las tablas.

## Ejecución

```bash
# Modo de desarrollo (con hot-reload, si está configurado)
npm run dev

# Modo de producción
npm run start
```

## Autenticación y Autorización

### Autenticación

La mayoría de las rutas están protegidas y requieren un token JWT.

1.  **Registro**: Los usuarios nuevos se crean a través del endpoint `POST /api/usuarios/crearUsuario`.
2.  **Login**: Los usuarios existentes inician sesión en `POST /api/auth/login` (basado en `auth.controller.ts`).
3.  **Acceso**: Al iniciar sesión, el usuario recibe un `token`. Este token debe ser enviado en el header `Authorization` de las siguientes peticiones:
    `Authorization: Bearer <tu_token_jwt>`

### Autorización (Privilegios)

El acceso a cada ruta protegida está determinado por privilegios específicos (definidos en `PRIVILEGIOS`). Un usuario debe tener un rol que contenga el privilegio requerido para acceder al endpoint.

## Modelos de Datos (Entidades)

  * **User**: Representa a un usuario. Tiene una relación `ManyToMany` con `Role`.
  * **Role**: Representa un rol (ej. "Admin"). Contiene un array de `privilegios` (strings) y una relación `ManyToMany` con `User`.
  * **Post**: Representa un artículo del blog. Tiene un `author` (relación `ManyToOne` con `User`) y `comments` (relación `OneToMany` con `Comment`).
  * **Comment**: Representa un comentario. Tiene un `author` (relación `ManyToOne` con `User`) y un `post` (relación `ManyToOne` con `Post`).

## API Endpoints

A continuación se detallan los endpoints de la API, agrupados por recurso.

Nota: Todas las rutas (excepto login y registro) requieren autenticación (`isAuthenticated`) y privilegios específicos (`requirePrivileileges`).

### 1\. Autenticación y Usuarios (`/api/usuarios`)

## Ruta: `POST /api/auth/login` Descripción: Iniciar sesión (Obtener token JWT). Privilegio Requerido: *Público*

## Ruta: `POST /api/usuarios/crearUsuario` Descripción: Registrar un nuevo usuario. Privilegio Requerido: *Público* (No se especifica `isAuthenticated` o `requirePrivileges` en esta ruta)

## Ruta: `GET /api/usuarios/obtenerUsuarios` Descripción: Listar todos los usuarios activos. Privilegio Requerido: `OBTENER_USUARIOS`

## Ruta: `GET /api/usuarios/obtenerUsuario/:idUsuario` Descripción: Obtener un usuario por su ID. Privilegio Requerido: `OBTENER_USUARIO_ID`

## Ruta: `GET /api/usuarios/:idUsuario/privilegios` Descripción: Obtener la lista consolidada de privilegios de un usuario. Privilegio Requerido: `OBTENER_PRIVILEGIOS_USUARIO`

## Ruta: `PUT /api/usuarios/editarUsuario/:idUsuario` Descripción: Editar la información de un usuario. Privilegio Requerido: `EDITAR_USUARIO`

## Ruta: `PATCH /api/usuarios/inactivarUsuario/:idUsuario` Descripción: Marcar un usuario como inactivo. Privilegio Requerido: `INACTIVAR_USUARIO`

## Ruta: `PUT /api/usuarios/roles/:idUsuario` Descripción: Reemplaza todos los roles de un usuario. Privilegio Requerido: `ASIGNAR_ROLES_USUARIO`

## Ruta: `POST /api/usuarios/roles/:idUsuario` Descripción: Agrega roles a un usuario (sin quitar los existentes). Privilegio Requerido: `AGREGAR_ROLES_USUARIO`

## Ruta: `DELETE /api/usuarios/roles/todos/:idUsuario` Descripción: Remueve todos los roles de un usuario. Privilegio Requerido: `REMOVER_TODOS_ROLES_USUARIO`

Ruta: `DELETE /api/usuarios/roles/:idUsuario`
Descripción: Remueve roles específicos de un usuario (enviados en el body).
Privilegio Requerido: `REMOVER_ROLES_USUARIO`

### 2\. Roles y Privilegios (`/api/roles`)

## Ruta: `POST /api/roles/crearRol` Descripción: Crear un nuevo rol. Privilegio Requerido: `AGREGAR_ROL`

## Ruta: `GET /api/roles/obtenerRoles` Descripción: Listar todos los roles activos. Privilegio Requerido: `OBTENER_ROLES`

## Ruta: `GET /api/roles/obtenerRol/:idRole` Descripción: Obtener un rol por su ID. Privilegio Requerido: `OBTENER_ROL_ID`

## Ruta: `PUT /api/roles/editarRol/:idRole` Descripción: Editar el nombre, descripción o estado de un rol. Privilegio Requerido: `EDITAR_ROL`

## Ruta: `PATCH /api/roles/:idRole/inactivar` Descripción: Marcar un rol como inactivo. Privilegio Requerido: `INACTIVAR_ROL`

## Ruta: `PUT /api/roles/:idRole/privilegios` Descripción: Reemplaza todos los privilegios de un rol. Privilegio Requerido: `ASIGNAR_PRIVILEGIOS_A_ROL`

## Ruta: `POST /api/roles/:idRole/privilegios` Descripción: Agrega privilegios a un rol (sin quitar los existentes). Privilegio Requerido: `ASIGNAR_PRIVILEGIOS_A_ROL`

## Ruta: `DELETE /api/roles/:idRole/privilegios/todos` Descripción: Remueve todos los privilegios de un rol. Privilegio Requerido: `REMOVER_PRIVILEGIOS_A_ROL`

Ruta: `DELETE /api/roles/:idRole/privilegios`
Descripción: Remueve privilegios específicos de un rol (enviados en el body).
Privilegio Requerido: `REMOVER_PRIVILEGIOS_A_ROL`

### 3\. Posts (`/api/posts`)

## Ruta: `POST /api/posts/crearPost` Descripción: Crear un nuevo post. Privilegio Requerido: `AGREGAR_POST`

## Ruta: `GET /api/posts/obtenerPosts` Descripción: Listar todos los posts. Privilegio Requerido: `OBTENER_POSTS`

## Ruta: `GET /api/posts/obtenerPost/:idPost` Descripción: Obtener un post por su ID. Privilegio Requerido: `OBTENER_POST_ID`

## Ruta: `GET /api/posts/usuario/:idUsuario` Descripción: Obtener todos los posts de un usuario específico. Privilegio Requerido: `OBTENER_POSTS_USUARIO`

## Ruta: `PUT /api/posts/editarPost/:idPost` Descripción: Editar el título o contenido de un post. Privilegio Requerido: `EDITAR_POST`

Ruta: `DELETE /api/posts/eliminarPost/:idPost`
Descripción: Eliminar un post.
Privilegio Requerido: `ELIMINAR_POST`

### 4\. Comentarios (Rutas anidadas en Posts)

## Ruta: `POST /api/posts/:idPost/comentarios` Descripción: Agregar un comentario a un post específico. Privilegio Requerido: `AGREGAR_COMENTARIO`

## Ruta: `GET /api/posts/:idPost/comentarios` Descripción: Listar todos los comentarios de un post específico. Privilegio Requerido: `OBTENER_COMENTARIOS_POST`

Ruta: `DELETE /api/posts/:idPost/comentarios/:idComentario`
Descripción: Eliminar un comentario específico de un post.
Privilegio Requerido: `ELIMINAR_COMENTARIO`

### 5\. Comentarios (Rutas de Recurso Principal `/api/comentarios`)

Estos endpoints ofrecen una gestión más directa de los comentarios, independientemente del post.

## Ruta: `POST /api/comentarios/crearComentario` Descripción: Crear un comentario (requiere `postId` y `authorId` en el body). Privilegio Requerido: `AGREGAR_COMENTARIO`

## Ruta: `GET /api/comentarios/obtenerComentarios` Descripción: Listar absolutamente todos los comentarios del sistema. Privilegio Requerido: `OBTENER_COMENTARIOS`

## Ruta: `GET /api/comentarios/obtenerComentario/:idComentario` Descripción: Obtener un comentario por su ID. Privilegio Requerido: `OBTENER_COMENTARIO_ID`

## Ruta: `GET /api/comentarios/post/:idPost` Descripción: Listar comentarios de un post (similar a la ruta anidada). Privilegio Requerido: `OBTENER_COMENTARIOS_POST`

## Ruta: `GET /api/comentarios/usuario/:idUsuario` Descripción: Listar todos los comentarios de un usuario específico. Privilegio Requerido: `OBTENER_COMENTARIOS_USUARIO`

## Ruta: `GET /api/comentarios/post/:idPost/recientes` Descripción: Obtener los comentarios recientes de un post (con límite). Privilegio Requerido: `OBTENER_COMENTARIOS_POST`

## Ruta: `PUT /api/comentarios/editarComentario/:idComentario` Descripción: Editar el contenido de un comentario. Privilegio Requerido: `EDITAR_COMENTARIO`

## Ruta: `DELETE /api/comentarios/eliminarComentario/:idComentario` Descripción: Eliminar un comentario por su ID. Privilegio Requerido: `ELIMINAR_COMENTARIO`

Ruta: `POST /api/comentarios/:idComentario/responder`
Descripción: Responde a un comentario (crea un nuevo comentario en el mismo post).
Privilegio Requerido: `AGREGAR_COMENTARIO`