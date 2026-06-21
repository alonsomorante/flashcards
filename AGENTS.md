# Flashcards — Contexto para agentes

## Qué es este proyecto
Aplicación personal de flashcards para estudiar. No tiene autenticación: es de un solo usuario.

## Stack

### Backend (`/backend`)
- Bun + Fastify + TypeScript
- Drizzle ORM + PostgreSQL (Neon)
- Arquitectura: servidor en `src/index.ts`, rutas REST en `src/routes/index.ts`, esquema en `src/db/schema.ts`

### Frontend (`/frontend`)
- React + Vite + TypeScript
- TanStack Query + React Router
- Tailwind CSS v4
- Fuente: Poppins (Google Fonts)

## URLs desplegadas

| Entorno | URL |
|---------|-----|
| Frontend producción | https://flashcards-frontend-seven.vercel.app |
| Backend producción | https://flashcards-buph.onrender.com |
| API base | https://flashcards-buph.onrender.com/api |

## Backend

### Variables de entorno
- `DATABASE_URL`: connection string de PostgreSQL (Neon).
- `PORT`: por defecto `3000`.
- `HOST`: debe ser `0.0.0.0` para Render.

### Comandos útiles
```bash
cd backend
bun run dev           # desarrollo con hot reload
bun run build         # compila TypeScript
bun start             # inicia producción
bun run db:generate   # genera migraciones
bun run db:migrate    # aplica migraciones
bun run db:push       # push del schema (cuidado en prod)
bun run db:studio     # Drizzle Studio
```

### Rutas API principales
- `GET /api/books`
- `POST /api/books` body `{ title }`
- `GET /api/books/:id`
- `DELETE /api/books/:id`
- `GET /api/books/:id/study`
- `GET /api/chapters/:id`
- `POST /api/chapters` body `{ bookId, title }`
- `DELETE /api/chapters/:id`
- `GET /api/chapters/:id/flashcards`
- `POST /api/flashcards` body `{ chapterId, front, back }`
- `PUT /api/flashcards/:id` body `{ front, back }`
- `DELETE /api/flashcards/:id`
- `GET /api/chapters/:id/study`

### Lógica de estudio
- 4 niveles de dominio: 0 (Olvidado) → 3 (Dominado).
- Decaimiento de 3 días: una flashcard que alcanza nivel efectivo >0 baja un nivel si no se repasa en 3 días.
- Estudio por capítulo: ordenado por nivel ascendente y antigüedad.
- Estudio por libro: selección aleatoria de flashcards.

## Frontend

### Variables de entorno
- `VITE_API_URL`: base URL del backend, ej. `https://flashcards-buph.onrender.com/api`.
- En Vercel debe configurarse como variable de build-time.

### Comandos útiles
```bash
cd frontend
bun run dev        # localhost:5173
bun run build      # build de producción
bunx vercel --prod -b VITE_API_URL=https://flashcards-buph.onrender.com/api
```

### Estructura de carpetas
- `src/routes/`: páginas (BooksPage, BookDetailPage, ChapterPage, StudyBookPage, StudyChapterPage)
- `src/components/`: componentes reutilizables (Layout, BookCard, ChapterCard, FlashcardItem, FlashcardForm, StudyCardView, StudySummary, StudySession)
- `src/hooks/`: hooks de TanStack Query y lógica de sesión de estudio
- `src/types/index.ts`: tipos compartidos incluyendo `LEVEL_LABELS`

### Diseño actual
- Estilo serio, minimalista y monocromático.
- Cards, botones e inputs con `rounded-lg` como radio máximo.
- Sin footer.
- Dark/light mode via `useTheme` hook usando `localStorage` y atributo `data-theme`.
- 3D flip se mantiene en `StudyCardView`.

## Decisiones importantes
- Sin autenticación.
- Borrados duros (`DELETE`) sin soft-delete.
- Frontend desplegado en Vercel; backend y base de datos en Render Free + Neon.
- Render Free tier duerme tras inactividad: el backend puede tardar ~30s en responder la primera petición.
- Los `DELETE` del frontend no deben enviar `Content-Type: application/json` con body vacío (ya corregido).

## Notas para no romper cosas
- No agregar `Content-Type` en peticiones DELETE vacías.
- Las variables de Vite deben empezar con `VITE_` y deben existir en build-time en Vercel.
- Las migraciones de Drizzle deben aplicarse antes de levantar el backend en producción.
- Mantener `HOST=0.0.0.0` en Render.
