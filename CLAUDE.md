# Little Claire Bakery — Frontend

## Descripción general

Frontend de una cafetería artesanal. Tiene dos partes: una **landing page pública** y un **panel de administrador protegido**. El backend es una API Laravel + Sanctum que corre en `http://localhost:8000`.

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | UI |
| TypeScript | 5 | Tipado estático |
| Vite | 8 | Bundler |
| Tailwind CSS | 4 (via `@tailwindcss/vite`) | Estilos |
| React Router | 7 | Navegación |
| TanStack Query | 5 | Cache y fetch de datos |
| Axios | 1 | HTTP client |
| react-hook-form + zod | 7 / 4 | Formularios (instalados, pendiente de usar) |

## Estructura de archivos

```
src/
├── api/
│   ├── client.ts          # Axios: baseURL, withCredentials, withXSRFToken, ensureCsrf()
│   ├── auth.ts            # login, logout, me
│   ├── categories.ts      # CRUD categorías
│   ├── products.ts        # CRUD productos + variantes + imágenes
│   ├── menus.ts           # CRUD menús + categorías/productos del menú
│   ├── promotions.ts      # CRUD promociones + productos
│   └── contacts.ts        # CRUD solicitudes de contacto
├── types/
│   └── index.ts           # Todas las interfaces TypeScript
├── components/
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── MenuSection.tsx
│   │   ├── PromotionsSection.tsx
│   │   └── ContactForm.tsx
│   └── admin/
│       ├── Layout.tsx       # Sidebar + Outlet
│       ├── Modal.tsx        # Modal genérico
│       ├── ConfirmDialog.tsx
│       └── Pagination.tsx
├── pages/
│   ├── landing/LandingPage.tsx
│   └── admin/
│       ├── LoginPage.tsx
│       ├── DashboardPage.tsx
│       ├── CategoriesPage.tsx
│       ├── ProductsPage.tsx
│       ├── MenusPage.tsx
│       ├── PromotionsPage.tsx
│       └── ContactsPage.tsx
├── hooks/
│   └── useAuth.ts         # Estado de sesión global vía React Query
├── router/
│   └── index.tsx          # Rutas + ProtectedRoute
├── lib/
│   └── utils.ts           # cn() helper (clsx + tailwind-merge)
├── App.tsx
├── main.tsx               # QueryClientProvider + BrowserRouter
└── index.css              # @import "tailwindcss"
```

## Autenticación

El backend usa **Laravel Sanctum con cookies de sesión** (no tokens Bearer).

Flujo:
1. `GET /sanctum/csrf-cookie` — obtener cookie XSRF-TOKEN (llamar una vez con `ensureCsrf()`)
2. `POST /api/admin/login` — autenticarse
3. Todas las requests llevan cookies automáticamente

`useAuth` llama a `GET /api/admin/me` al montar para verificar si hay sesión activa. `ProtectedRoute` redirige a `/admin/login` si `isAuthenticated` es `false`.

## Rutas

| Path | Componente | Protegida |
|---|---|---|
| `/` | LandingPage | No |
| `/admin/login` | LoginPage | No |
| `/admin` | DashboardPage | Sí |
| `/admin/categories` | CategoriesPage | Sí |
| `/admin/products` | ProductsPage | Sí |
| `/admin/menus` | MenusPage | Sí |
| `/admin/promotions` | PromotionsPage | Sí |
| `/admin/contacts` | ContactsPage | Sí |

## Convenciones del API

- Las respuestas de listas paginadas tienen `{ data, links, meta }` — usar `PaginatedResponse<T>`
- Las respuestas de recursos anidados (variantes, imágenes, categorías/productos de menú) son arrays planos
- Los recursos individuales (show/store/update) se devuelven **directamente**, sin wrapper `data`
- `price` en variantes viene como string decimal (`"45.00"`)
- El PDF del menú se regenera automáticamente en el servidor al modificar un menú — el frontend no hace nada extra

## Patrones del admin

Cada página del admin sigue el mismo patrón:
1. `useQuery` para fetch de datos paginados
2. `useMutation` para create/update/delete, con `qc.invalidateQueries` en `onSuccess`
3. Estado local para controlar qué modal está abierto y qué item se está editando
4. `Modal` genérico con el formulario dentro
5. `ConfirmDialog` para confirmar eliminar

## Comandos

```bash
npm run dev      # desarrollo en localhost:5173
npm run build    # build de producción (TypeScript + Vite)
npm run lint     # ESLint
```

## Estado actual

- [x] Proyecto migrado a TypeScript
- [x] Tailwind CSS v4 configurado
- [x] API layer completo (todos los endpoints del API.md)
- [x] Tipos TypeScript para todas las entidades
- [x] Auth con Sanctum (cookie) + ProtectedRoute
- [x] Landing page: Hero, Menús, Promociones, Contacto
- [x] Admin: Login, Dashboard, Categories, Products, Menus, Promotions, Contacts
- [x] Build limpio (0 errores TS, 0 warnings)
- [ ] shadcn/ui no instalado — los componentes del admin usan Tailwind puro
- [ ] react-hook-form / zod instalados pero no usados todavía (formularios con state local)
- [ ] Sin tests
- [ ] Sin manejo de errores global (interceptor Axios)
