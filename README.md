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

## Deploy gratis (Vercel + Render)

El repo ya incluye:

- `render.yaml` para levantar `back/` en Render Free desde rama `main`.
- `back/.env.example` y `front/.env.example` como referencia de variables.

### Flujo de ramas recomendado

Si queres `dev` para desarrollo y `main` para produccion, este flujo funciona bien:

1. Crear ramas:

```bash
git checkout -b dev
```

2. Configurar deploys automáticos:

- Vercel: deploy desde rama `main`.
- Render: `render.yaml` ya apunta a rama `main`.

3. Trabajo diario:

- Haces cambios en `dev`.
- Cuando queres publicar, mergeas `dev` -> `main`.
- Ese push dispara redeploy en Vercel y Render.

Ejemplo:

```bash
git checkout main
git merge dev
git push origin main
```

### Backend en Render (free)

1. Push de este repo a GitHub.
2. En Render: `New` -> `Blueprint` y selecciona el repo.
3. Render leerá `render.yaml` y creará el servicio web de `back/`.
4. En variables, deja `CORS_ORIGIN` con tu URL real de Vercel.

URL esperada del backend:

- `https://<tu-servicio>.onrender.com`

### Frontend en Vercel (free)

1. En Vercel: `Add New...` -> `Project`.
2. Selecciona este repo.
3. Root Directory: `front`.
4. Build command: `npm run build` (default de Next sirve).
5. Agrega variable:

```bash
NEXT_PUBLIC_API_BASE_URL=https://<tu-servicio>.onrender.com
```

6. Configura Production Branch = `main`.

### Conexion CORS

Para que el browser permita requests del front al back:

- En Render, `CORS_ORIGIN` debe ser tu dominio de Vercel.
- Ejemplo: `https://electivas-itba.vercel.app`

### Notas del plan gratuito

- Render Free puede dormir el backend por inactividad (cold start).
- Vercel Hobby es gratis para proyectos personales.

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
