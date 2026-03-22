# Little Claire Bakery — API Reference

## Base URL

```
http://localhost:8000/api
```

---

## Autenticación

La API usa **Laravel Sanctum con cookies de sesión** (no tokens Bearer).

### Setup obligatorio en el cliente Axios/fetch

```js
// axios — configurar una sola vez
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;          // envía/recibe cookies
axios.defaults.withXSRFToken = true;            // maneja el token CSRF automáticamente
axios.defaults.headers.common['Accept'] = 'application/json';
```

### Flujo de login

```
1. GET  http://localhost:8000/sanctum/csrf-cookie   ← obtener cookie XSRF-TOKEN
2. POST /api/admin/login                            ← autenticarse
3. Todas las requests siguientes llevan cookies automáticamente
```

> **Importante:** sin el paso 1 el login devuelve 419. Solo hay que hacerlo una vez (al iniciar la app o antes del primer POST).

---

## Formato de respuestas

### Lista paginada (index con paginación)

```json
{
  "data": [ { ... }, { ... } ],
  "links": {
    "first": "http://localhost:8000/api/categories?page=1",
    "last":  "http://localhost:8000/api/categories?page=3",
    "prev":  null,
    "next":  "http://localhost:8000/api/categories?page=2"
  },
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 20,
    "total": 55
  }
}
```

Cambiar página: `GET /api/categories?page=2`

### Lista plana (index sin paginación)

```json
[ { ... }, { ... } ]
```

### Recurso individual (show / store / update)

```json
{ "id": 1, "name": "..." }
```

Sin wrapper `data` — la respuesta es el objeto directamente.

### Errores de validación — 422

```json
{
  "message": "The name field is required.",
  "errors": {
    "name": ["The name field is required."]
  }
}
```

### No autorizado — 401

```json
{ "message": "Unauthenticated." }
```

### Rate limit excedido — 429

```json
{ "message": "Too Many Attempts." }
```

---

## Auth

### POST `/api/admin/login`

Rate limit: 5 intentos/minuto.

**Body:**
```json
{ "email": "admin@example.com", "password": "secret" }
```

**Respuestas:**
- `204 No Content` — login exitoso, cookie de sesión seteada
- `422` — credenciales inválidas

---

### GET `/api/admin/me` 🔒

**Respuesta `200`:**
```json
{ "id": 1, "email": "admin@example.com" }
```

---

### POST `/api/admin/logout` 🔒

**Respuesta:** `204 No Content`

---

## Categorías

### GET `/api/categories` — lista paginada

```json
{
  "data": [
    {
      "id": 1,
      "name": "Cafés",
      "description": null,
      "image_url": null,
      "is_visible": true,
      "position": 1
    }
  ],
  "meta": { ... }
}
```

---

### GET `/api/categories/{id}` — detalle

```json
{
  "id": 1,
  "name": "Cafés",
  "description": null,
  "image_url": null,
  "is_visible": true,
  "position": 1
}
```

---

### POST `/api/categories` 🔒

**Body:**
| Campo | Tipo | Requerido |
|-------|------|-----------|
| `name` | string (max 255) | ✅ |
| `description` | string | ❌ nullable |
| `image_url` | string | ❌ nullable |
| `is_visible` | boolean | ❌ (default true) |
| `position` | integer | ❌ |

**Respuesta:** `201` con el objeto creado.

---

### PUT `/api/categories/{id}` 🔒

Mismos campos que store, todos opcionales.

**Respuesta:** `200` con el objeto actualizado.

---

### DELETE `/api/categories/{id}` 🔒

**Respuesta:** `204 No Content`

---

## Productos

### GET `/api/products` — lista paginada

```json
{
  "data": [
    {
      "id": 1,
      "category_id": 2,
      "name": "Latte",
      "description": null,
      "is_active": true,
      "variants": [
        { "id": 1, "product_id": 1, "label": "Chico", "price": "45.00", "position": 1, "is_active": true },
        { "id": 2, "product_id": 1, "label": "Grande", "price": "55.00", "position": 2, "is_active": true }
      ]
    }
  ],
  "meta": { ... }
}
```

> Un producto con una sola variante y `label: null` es un producto de precio único clásico.

---

### GET `/api/products/{id}` — detalle (incluye variantes)

Misma forma que cada item del index.

---

### POST `/api/products` 🔒

**Body:**
| Campo | Tipo | Requerido |
|-------|------|-----------|
| `category_id` | integer (existe en categories) | ✅ |
| `name` | string (max 255) | ✅ |
| `description` | string | ❌ nullable |
| `is_active` | boolean | ❌ |

**Respuesta:** `201` con el objeto creado (sin variantes).

---

### PUT `/api/products/{id}` 🔒

Mismos campos que store, todos opcionales.

**Respuesta:** `200` con el objeto actualizado.

---

### DELETE `/api/products/{id}` 🔒

**Respuesta:** `204 No Content`

---

## Variantes de producto

### GET `/api/products/{product}/variants`

```json
[
  { "id": 1, "product_id": 1, "label": "Chico", "price": "45.00", "position": 1, "is_active": true }
]
```

---

### GET `/api/products/{product}/variants/{variant}`

Mismo objeto individual.

---

### POST `/api/products/{product}/variants` 🔒

**Body:**
| Campo | Tipo | Requerido |
|-------|------|-----------|
| `price` | numeric (≥ 0) | ✅ |
| `position` | integer (≥ 1) | ✅ |
| `label` | string (max 100) | ❌ nullable — omitir para precio único |
| `is_active` | boolean | ❌ |

**Respuesta:** `201` con la variante creada.

---

### PUT `/api/products/{product}/variants/{variant}` 🔒

Mismos campos, todos opcionales.

**Respuesta:** `200` con la variante actualizada.

---

### DELETE `/api/products/{product}/variants/{variant}` 🔒

**Respuesta:** `204 No Content`

---

## Imágenes de variante

### GET `/api/products/{product}/variants/{variant}/images`

```json
[
  { "id": 1, "product_variant_id": 3, "image_url": "https://...", "position": 1 }
]
```

---

### POST `/api/products/{product}/variants/{variant}/images` 🔒

**Body:**
| Campo | Tipo | Requerido |
|-------|------|-----------|
| `image_url` | string URL (max 2048) | ✅ |
| `position` | integer (≥ 1) | ✅ |

**Respuesta:** `201` con la imagen creada.

---

### PUT `/api/products/{product}/variants/{variant}/images/{image}` 🔒

| Campo | Tipo | Requerido |
|-------|------|-----------|
| `image_url` | string URL | ❌ |
| `position` | integer (≥ 1) | ❌ |

**Respuesta:** `200` con la imagen actualizada.

---

### DELETE `/api/products/{product}/variants/{variant}/images/{image}` 🔒

**Respuesta:** `204 No Content`

---

## Menús

### GET `/api/menus` — lista paginada

```json
{
  "data": [
    { "id": 1, "name": "Menú Principal", "description": null, "is_active": true }
  ],
  "meta": { ... }
}
```

---

### GET `/api/menus/{id}`

Mismo objeto individual.

---

### POST `/api/menus` 🔒

**Body:**
| Campo | Tipo | Requerido |
|-------|------|-----------|
| `name` | string (max 255) | ✅ |
| `description` | string | ❌ nullable |
| `is_active` | boolean | ❌ |

**Respuesta:** `201` con el menú creado.

> Al actualizar un menú (`PUT`) el PDF se regenera automáticamente en el servidor.

---

### PUT `/api/menus/{id}` 🔒

Mismos campos, todos opcionales. Dispara regeneración del PDF.

**Respuesta:** `200` con el menú actualizado.

---

### DELETE `/api/menus/{id}` 🔒

**Respuesta:** `204 No Content`

---

## Categorías de un menú

### GET `/api/menus/{menu}/categories`

```json
[
  { "id": 2, "name": "Cafés", "description": null, "image_url": null, "is_visible": true, "position": 1 }
]
```

> `position` aquí es la posición dentro del menú, no la posición global de la categoría.

---

### POST `/api/menus/{menu}/categories` 🔒

Adjunta una categoría al menú. Dispara regeneración del PDF.

**Body:**
```json
{ "category_id": 2, "position": 1 }
```

**Respuestas:**
- `201` — adjuntada correctamente
- `409` — la categoría ya está en el menú

---

### PUT `/api/menus/{menu}/categories/order` 🔒

Reordena categorías dentro del menú. Dispara regeneración del PDF.

**Body:**
```json
{
  "categories": [
    { "id": 2, "position": 1 },
    { "id": 5, "position": 2 }
  ]
}
```

**Respuesta:** `204 No Content`

---

### DELETE `/api/menus/{menu}/categories/{category}` 🔒

Desvincula la categoría del menú. Dispara regeneración del PDF.

**Respuesta:** `204 No Content`

---

## Productos de un menú

### GET `/api/menus/{menu}/products`

```json
[
  {
    "id": 1,
    "name": "Latte",
    "description": null,
    "is_active": true,
    "position": 1,
    "variants": [
      { "id": 1, "label": "Chico", "price": "45.00", "position": 1, "is_active": true }
    ]
  }
]
```

---

### POST `/api/menus/{menu}/products` 🔒

Adjunta un producto al menú. Dispara regeneración del PDF.

**Body:**
```json
{ "product_id": 1, "position": 1 }
```

**Respuesta:** `201`

---

### PUT `/api/menus/{menu}/products/order` 🔒

Reordena productos dentro del menú. Dispara regeneración del PDF.

**Body:**
```json
{
  "products": [
    { "id": 1, "position": 2 },
    { "id": 3, "position": 1 }
  ]
}
```

**Respuesta:** `204 No Content`

---

### PUT `/api/menus/{menu}/products/{product}` 🔒

**No-op intencional.** Existe para no romper el frontend. Devuelve `204` sin hacer nada.

---

### DELETE `/api/menus/{menu}/products/{product}` 🔒

Desvincula el producto del menú. Dispara regeneración del PDF.

**Respuesta:** `204 No Content`

---

## Promociones

### GET `/api/promotions` — lista paginada (orden: más reciente primero)

```json
{
  "data": [
    {
      "id": 1,
      "title": "2x1 en cafés",
      "description": null,
      "discount_type": "percentage",
      "discount_value": "20.00",
      "starts_at": "2026-03-01T00:00:00Z",
      "ends_at": "2026-03-31T00:00:00Z",
      "is_active": true
    }
  ],
  "meta": { ... }
}
```

`discount_type` valores posibles: `"percentage"` | `"fixed"`

---

### GET `/api/promotions/{id}`

Mismo objeto individual.

---

### POST `/api/promotions` 🔒

**Body:**
| Campo | Tipo | Requerido |
|-------|------|-----------|
| `title` | string (max 255) | ✅ |
| `discount_type` | `"percentage"` \| `"fixed"` | ✅ |
| `discount_value` | numeric | ✅ (% entre 1–100 si percentage; > 0 si fixed) |
| `description` | string | ❌ nullable |
| `starts_at` | date | ❌ nullable |
| `ends_at` | date (≥ starts_at) | ❌ nullable |
| `is_active` | boolean | ❌ |

**Respuesta:** `201` con la promoción creada.

---

### PUT `/api/promotions/{id}` 🔒

Mismos campos, todos requeridos en update (excepto `description`, `starts_at`, `ends_at`).

**Respuesta:** `200` con la promoción actualizada.

---

### DELETE `/api/promotions/{id}` 🔒

**Respuesta:** `204 No Content`

---

## Productos de una promoción

### GET `/api/promotions/{promotion}/products`

```json
[
  { "id": 1, "category_id": 2, "name": "Latte", "description": null, "is_active": true }
]
```

---

### POST `/api/promotions/{promotion}/products` 🔒

**Body:**
```json
{ "product_id": 1 }
```

**Respuestas:**
- `201 { "product_id": 1 }` — adjuntado
- `409` — ya estaba adjuntado

---

### DELETE `/api/promotions/{promotion}/products/{product}` 🔒

**Respuesta:** `204 No Content`

---

## Solicitudes de contacto

### POST `/api/contact-requests`

Rate limit: 10 envíos/minuto.

**Body:**
| Campo | Tipo | Requerido |
|-------|------|-----------|
| `name` | string (max 255) | ✅ |
| `email` | string email | ✅ |
| `phone` | string | ✅ |
| `type` | `"general"` \| `"catering"` | ✅ |
| `message` | string | ❌ nullable |

**Respuesta:** `201` con el objeto creado.

---

### GET `/api/contact-requests` 🔒 — lista completa (sin paginación)

```json
[
  {
    "id": 1,
    "name": "María",
    "email": "maria@example.com",
    "phone": "555-1234",
    "message": "Hola!",
    "type": "general",
    "is_read": false
  }
]
```

---

### GET `/api/contact-requests/{id}` 🔒

Mismo objeto individual.

---

### PUT `/api/contact-requests/{id}` 🔒

Usado principalmente para marcar como leído (`is_read: true`).

---

### DELETE `/api/contact-requests/{id}` 🔒

**Respuesta:** `204 No Content`

---

## Notas de implementación

- 🔒 = requiere estar autenticado como admin (cookie de sesión)
- El PDF del menú se regenera automáticamente en el servidor al modificar menus, categorías de menú o productos de menú — el frontend no necesita hacer nada adicional
- `price` viene como string decimal (`"45.00"`), no como number
- Los timestamps (`starts_at`, `ends_at`) vienen en formato ISO 8601
