# Assistant-Document **Frontend**

Chat web en React + Vite que permite preguntarle a GPT sobre los documentos (PDF / TXT) que subes en cada conversación.

---

## 🗂 Estructura
```bash
src/
├ api/            # helpers fetch (request.ts)
├ components/     # Button, Textarea, ChatBubble, LoadingDots, …
├ hooks/          # useChat (WebSocket + uploads)
├ layout/         # DefaultLayout
├ pages/          # ChatPage.tsx
├ styles/         # utilidades CSS (drag-and-drop)
├ index.css       # Tailwind + design-tokens
└ main.tsx
```

## ⚙️ Requisitos

| Herramienta | Versión |
| ----------- | ------- |
| **Node.js** | ≥ 20.19 (LTS) |
| **npm / pnpm / yarn** | cualquiera |
| **Backend** | corriendo en `http://localhost:8000` (o la URL que pongas en el `.env`) |


## .env
```env
VITE_BACKEND_URL=http://localhost:8000
```

## Arranque Local
```bash
nvm install 20.19
nvm use 20.19
npm install
cp .env.example .env
npm run dev
```

## Arranque con Docker
```bash
docker compose build
docker compose up
```

## Características
- **Subida de Archivos**: arrastra y suelta archivos PDF o TXT.
- **WebSocket**: conexión en tiempo real para enviar mensajes y recibir respuestas.
- **Chat**: interfaz de chat con mensajes y respuestas.
- **Diseño Responsivo**: adaptado para móviles y escritorio.
- **Carga de Archivos**: arrastrar y soltar archivos para subirlos.
- **Streaming token-a-token**: con animación de typing (tres puntitos).