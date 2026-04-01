# Electivas ITBA

Proyecto separado en `back/` y `front/`.

- `back/`: API lista para Render. Sirve los JSON ya extraidos y conserva los scrapers.
- `front/`: app base en Next.js lista para Vercel. Por ahora solo deja preparadas las funciones GET para consumir la API.

## Requisitos

- Node.js 18+

## Estructura

```text
back/
  data/
  scripts/
  scrapers/
  src/
front/
  src/app/
  src/lib/
```

## Seguridad

- El repo ignora los archivos `.env`.
- No publiques credenciales de SGA.
- El backend expone solo los JSON generados en `back/data/`.

## Backend

Configurar `back/.env`.

Scripts:

```bash
cd back
npm install
npm run start
```

Smoke test rapido:

```bash
cd back
npm run smoke:test
```

Endpoints:

- `GET /health`
- `GET /api/carreras`
- `GET /api/carreras/informatica/electivas`
- `GET /api/carreras/bioingenieria/electivas`

Scrapers disponibles en backend:

- `electivas_informatica`
- `electivas_bioingenieria`

Para regenerar JSON:

```bash
cd back
npm run scrape:informatica
npm run scrape:bioingenieria
```

## Frontend

Configurar `front/.env`.

```bash
cd front
npm install
npm run dev
```

Smoke test rapido:

```bash
cd front
npm run smoke:test
```

La URL del backend se configura con:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

Las funciones GET estan en `front/src/lib/api.js`.

Formato de cada item JSON:

```json
{
	"materia": {
		"codigo": "10.07",
		"nombre": "Creatividad"
	},
	"contenidos_minimos": "Que se entiende por creatividad..."
}
```
