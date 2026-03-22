# Little Claire Bakery — Estado del proyecto

**Última actualización:** 2026-03-20

---

## Resumen

Frontend completo de una cafetería artesanal construido con Vite + React 19 + TypeScript + Tailwind CSS.

El proyecto tiene dos partes:
- **Landing page pública** — Hero, menús activos, promociones activas, formulario de contacto
- **Panel de administrador** — protegido con sesión, gestión completa de contenido

El backend es una API REST Laravel con autenticación Sanctum por cookies. Corre en `http://localhost:8000`.

---

## Lo que está implementado

### Infraestructura
- Migración completa de JSX → TypeScript
- Tailwind CSS v4 configurado via `@tailwindcss/vite`
- Alias `@/` apuntando a `src/`
- `tsconfig.app.json` + `tsconfig.node.json` + `tsconfig.json`
- Build limpio: **0 errores TS, 0 warnings**

### API Layer (`src/api/`)
Cada módulo refleja un recurso del backend. Todos tipados.

| Módulo | Endpoints cubiertos |
|---|---|
| `client.ts` | Axios con `withCredentials`, `withXSRFToken`, `ensureCsrf()` |
| `auth.ts` | `login`, `logout`, `me` |
| `categories.ts` | CRUD completo |
| `products.ts` | CRUD productos + CRUD variantes + CRUD imágenes de variante |
| `menus.ts` | CRUD menús + agregar/quitar/reordenar categorías y productos del menú |
| `promotions.ts` | CRUD promociones + agregar/quitar productos |
| `contacts.ts` | Crear (público) + listar/leer/actualizar/eliminar (admin) |

### Tipos (`src/types/index.ts`)
- `Category`, `Product`, `ProductVariant`, `VariantImage`
- `Menu`, `Promotion`, `ContactRequest`, `User`
- `PaginatedResponse<T>`, `ApiError`

### Autenticación
- `useAuth` hook: consulta `GET /api/admin/me` al montar via React Query
- `ProtectedRoute` en el router redirige a `/admin/login` si no hay sesión activa

### Landing Page
| Sección | Fuente de datos |
|---|---|
| Hero | Estático |
| Menú | `GET /api/menus` (activos) + categorías y productos de cada menú |
| Promociones | `GET /api/promotions` (activas) — oculta la sección si no hay ninguna |
| Contacto | `POST /api/contact-requests` — muestra errores 422 por campo, mensaje de éxito al enviar |

### Panel de Administrador

**Login** (`/admin/login`)
- Formulario email + contraseña
- Muestra error del servidor si las credenciales son incorrectas
- Redirige a `/admin` si ya hay sesión activa

**Dashboard** (`/admin`)
- Bienvenida con email del usuario
- Links a todas las secciones

**Categorías** (`/admin/categories`)
- Tabla paginada
- Toggle rápido de `is_visible` desde la tabla (sin abrir modal)
- Modal crear/editar: nombre, descripción, URL imagen, posición, visible
- Confirmación antes de eliminar

**Productos** (`/admin/products`)
- Lista de productos expandida con variantes inline
- CRUD de productos (nombre, categoría, descripción, activo)
- CRUD de variantes por producto (etiqueta, precio, posición, activo)
- La etiqueta es opcional (precio único si se deja vacía)

**Menús** (`/admin/menus`)
- Tabla de menús con CRUD
- Modal de "Contenido" para gestionar qué categorías y productos incluye cada menú
- Reordenamiento con flechas ↑↓ (llama a `PUT /api/menus/{menu}/categories/order`)
- Botones para agregar (select) y quitar (×) categorías/productos

**Promociones** (`/admin/promotions`)
- Tabla con título, tipo de descuento, vigencia y estado
- CRUD completo (tipo: porcentaje o fijo, fechas opcionales)
- Modal de productos: asignar/desasignar productos a la promoción

**Contactos** (`/admin/contacts`)
- Vista de dos paneles: lista + detalle
- Se marca automáticamente como leído al seleccionar
- Punto naranja en mensajes no leídos
- Botón eliminar en el detalle

---

## Qué falta / deuda técnica

| Item | Notas |
|---|---|
| **shadcn/ui** | Instalado como dependencia pero no inicializado. Los componentes del admin usan Tailwind puro. |
| **react-hook-form + zod** | Instalados, no usados. Los formularios usan `useState` con state local. |
| **Interceptor global de errores** | No hay manejo global de 401/429. Cada componente maneja sus errores localmente. |
| **Sin tests** | No hay ningún test unitario ni e2e. |
| **Paginación del admin limitada** | Sólo se cargan la primera página de categorías/productos en los selects de Menús y Promociones. Si hay más de 20 items, los selects no los mostrarán. |
| **Imágenes de variante** | El API layer está completo pero no hay UI para gestionarlas. |
| **Reordenamiento de categorías globales** | La posición se edita manualmente en el formulario, no hay drag & drop. |

---

## Cómo correr el proyecto

```bash
# Requisito: backend Laravel corriendo en http://localhost:8000
npm run dev      # http://localhost:5173
npm run build    # build de producción
```
