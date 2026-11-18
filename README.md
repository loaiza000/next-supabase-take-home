# Medallo Take Home

Next.js app with local [Supabase](https://supabase.com) development via Docker.

---

## Setup (English)

### System requirements

Install the following before working on this repository:

| Requirement | Version | Install |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 24 or later | [nodejs.org/en/download](https://nodejs.org/en/download) |
| [Docker](https://www.docker.com/) | Latest stable | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/) |
| [pnpm](https://pnpm.io/) | 10 or later | [pnpm.io/installation](https://pnpm.io/installation) |

Docker must be running before you start the development server. Supabase runs locally in Docker containers.

Verify your versions:

```bash
node --version   # v24.x or later
docker --version
pnpm --version   # 10.x or later
```

### Installation

1. Clone the repository and enter the project directory:

   ```bash
   git clone <repository-url>
   cd take-home
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables by running the setup script:

   ```bash
   pnpm setup:env
   ```

   This starts local Supabase, reads credentials from `supabase status -o env`, and writes them to `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

   `.env.local` is gitignored and is the file Next.js loads at development time. Do not commit secrets.

   To configure manually instead, create `.env.local` with the two values shown above.

4. Apply migrations and import the CSV:

   ```bash
   pnpm exec supabase db reset
   ```

   In Windows PowerShell, use `pnpm.cmd` in place of `pnpm` if the execution policy blocks `pnpm.ps1`. The setup script uses Node and runs on both Windows and Unix.

### Running the app

Start Supabase and the Next.js dev server together:

```bash
pnpm dev
```

This runs `supabase start` and `next dev` concurrently. Open [http://localhost:3000](http://localhost:3000) once both services are ready.

To run services separately:

```bash
pnpm dev:supabase   # Start local Supabase (Docker)
pnpm dev:next       # Start Next.js only
```

### Other commands

```bash
pnpm setup:env   # Start Supabase and write .env.local
pnpm build      # Production build
pnpm start      # Run production server
pnpm lint       # Run ESLint
pnpm test       # Run tests in watch mode
pnpm test:run   # Run tests once
```

---

## Exercise (English)

After completing setup, build a feature that loads the coffee health dataset into Supabase and displays it in a filterable table in the Next.js app.

### Dataset

The file `data/synthetic_coffee_health_10000.csv` contains **10,000 rows** of synthetic health and coffee consumption data. Each row has these columns:

| Column | Type |
| --- | --- |
| `ID` | integer |
| `Age` | integer |
| `Gender` | text |
| `Country` | text |
| `Coffee_Intake` | decimal |
| `Caffeine_mg` | decimal |
| `Sleep_Hours` | decimal |
| `Sleep_Quality` | text |
| `BMI` | decimal |
| `Heart_Rate` | integer |
| `Stress_Level` | text |
| `Physical_Activity_Hours` | decimal |
| `Health_Issues` | text |
| `Occupation` | text |
| `Smoking` | integer (0 or 1) |
| `Alcohol_Consumption` | integer (0 or 1) |

### Part 1 — Load the data into Supabase

1. Design a Postgres table (or tables) that stores this dataset. Add a migration under `supabase/migrations/` and/or a schema file under `supabase/schemas/`.
2. Load all 10,000 rows from the CSV into your local database. You may use any reasonable approach — for example, a seed script, a one-off loader script, or Postgres `COPY`.
3. Apply your changes locally:

   ```bash
   pnpx supabase db reset   # runs migrations and seed.sql
   ```

   Or run only the steps you need (`supabase migration up`, custom import script, etc.).

4. Verify the row count in the database matches the CSV (10,000 rows).

The starter project includes a sample `notes` table and Supabase client helpers in `lib/supabase/`. You can keep, replace, or extend these as you see fit.

### Part 2 — Render a filterable table in Next.js

Build a page in the Next.js app that displays the loaded data in a table and lets the user filter it.

At minimum, support filtering on a few meaningful columns — for example, country, gender, sleep quality, stress level, or numeric ranges (age, coffee intake, BMI). You decide which filters are most useful and how they should behave (exact match, multi-select, min/max, etc.).

UI components are available in `components/ui/` (including `table`, `input`, `button`, and others). Use them or replace them with your own.

### Part 3 — Think about scale

10,000 rows is small for Postgres but large enough to expose naive UI and query patterns. **Design with scale in mind** — assume the dataset could grow to hundreds of thousands or millions of rows.

Document any trade-offs or assumptions in your submission. We are interested in how you reason about performance, not in one specific library choice.

### Using AI

AI-assisted development is welcome. You may use coding assistants, chatbots, or other AI tools while working on this exercise.

During review, we will assume you understand your submission and can explain your approach — why you made certain choices, how the solution works, and what trade-offs you considered. Use AI however helps you, but make sure you could walk us through the code without it.

### What to deliver

- Working local setup: data loaded, table visible at [http://localhost:3000](http://localhost:3000) (or a route you add).
- Brief notes on your schema, import approach, filtering strategy, and scale decisions.

## Implementation notes

### Data and schema

The CSV has 10,000 rows, 10,000 unique IDs (1–10,000), no missing values, and no duplicate rows. Numeric measurements have at most one decimal place. Observed ranges include age 18–80, coffee intake 0–8.2, caffeine 0–780.3 mg, sleep 3–10 hours, BMI 15–38.2, heart rate 50–109, and physical activity 0–15 hours. There are 20 countries, 3 genders, 4 sleep qualities, and 3 stress levels.

One `coffee_health` table preserves the source row shape. The CSV ID is its primary key; measurements use bounded `numeric` or `smallint`, and the two 0/1 columns use `boolean`. `NOT NULL` reflects the source; broad physical sanity checks prevent obvious invalid values without treating today's synthetic categories as permanent database enums. Snake case column names follow Postgres conventions. Only `SELECT` is granted to `anon` and `authenticated`, with a matching read policy under RLS. The page uses the public anon key under RLS; it does not need a service secret.

`supabase/seed.sql` contains 20 batches of 500 inserts generated from the CSV. This duplicates the source file in the repository, but makes `supabase db reset` self-contained and reliable on Windows and in the Supabase CLI. Rebuild the seed from the CSV if the dataset changes. The local database was verified at 10,000 rows with `sum(age) = 349491` and `sum(coffee_intake) = 25092.3`. A canonical, ID-ordered serialization of every field in every database row had the same MD5 hash as the CSV (`bf4600e6faa7f988e201e30add178cf9`), verifying the full import.

For a much larger import, use PostgreSQL `COPY` through a separate loader and build indexes after the load. The generated `INSERT` seed is intended for this 10,000-row exercise.

### Querying and scale

The filter controls are the only page-specific Client Component. Category changes navigate immediately through the Next.js router; age changes wait 400 ms. Each change replaces the search params, drops the page cursor, and preserves page scroll. Invalid age ranges stay in the controls without starting a query. The server still validates direct URLs before querying Supabase. PostgreSQL applies exact category filters, an inclusive age range, and deterministic `id` ordering. It fetches 51 rows to display 50 and determine whether another page exists. Previous/next links carry the filters in the URL. No full dataset is fetched into Node or the browser.

There is no application-level cache: each page navigation reads current data through the anon Supabase client. Automatic filters add a small amount of client state and JavaScript compared with the former GET form, but avoid a submit button and coalesce age keystrokes. Filter changes use `router.replace` so typing does not fill browser history; pagination links still use normal Next.js navigation. Browser back/forward restores the controls from the URL. The table and database access remain on the server.

Keyset pagination on the unique ID keeps navigation work bounded for deep pages; `OFFSET` would still scan or skip preceding rows. The trade-off is no direct page number or arbitrary sort, and changing data can alter page membership between requests. A future requirement for sorting by a measurement would need a matching `(sort_column, id)` cursor and index. The UI deliberately avoids an exact total for every filter because `COUNT(*)` must visit matching entries and becomes expensive at large scale. Filter options are based on the known CSV categories; if categories become dynamic, query a maintained lookup/facet source instead of repeatedly running `DISTINCT` over millions of rows.

The migration keeps `(country, id)` and `(age, id)` indexes alongside the primary key. Country is the most selective categorical filter, and the age index helps exact-age searches; lower-selectivity gender, sleep, and stress indexes did not help the measured page queries and were removed. Each index costs storage and slows writes. On 10,000 rows, `EXPLAIN (ANALYZE, BUFFERS)` chose the primary key for a Germany page (0.114 ms) and a combined gender/sleep/age page (0.143 ms). In temporary tables with repeated source distributions and the final index set, a Germany page took 0.117 ms at 100,000 rows. A rare combination with no matches past the cursor took 1.091 ms at 100,000 rows (country index plus sort), but 48.872 ms at 1,000,000 rows (primary-key scan of 500,000 IDs). The exact Germany count took 3.374 ms and 26.291 ms respectively. The temporary tables were dropped, and the delivery database still has 10,000 rows. These local measurements are not production guarantees; index choices need real distributions and query frequencies. Exact totals or dynamic facets would need a separate product justification.

---

## Configuración (Español)

### Requisitos del sistema

Instala lo siguiente antes de trabajar en este repositorio:

| Requisito | Versión | Instalación |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 24 o superior | [nodejs.org/en/download](https://nodejs.org/en/download) |
| [Docker](https://www.docker.com/) | Última versión estable | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/) |
| [pnpm](https://pnpm.io/) | 10 o superior | [pnpm.io/installation](https://pnpm.io/installation) |

Docker debe estar en ejecución antes de iniciar el servidor de desarrollo. Supabase se ejecuta localmente en contenedores Docker.

Verifica tus versiones:

```bash
node --version   # v24.x o superior
docker --version
pnpm --version   # 10.x o superior
```

### Instalación

1. Clona el repositorio y entra al directorio del proyecto:

   ```bash
   git clone <url-del-repositorio>
   cd take-home
   ```

2. Instala las dependencias:

   ```bash
   pnpm install
   ```

3. Configura las variables de entorno ejecutando el script de configuración:

   ```bash
   pnpm setup:env
   ```

   Esto inicia Supabase localmente, lee las credenciales de `supabase status -o env` y las escribe en `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

   `.env.local` está en `.gitignore` y es el archivo que Next.js carga en desarrollo. No subas secretos al repositorio.

   Para configurar manualmente, crea `.env.local` con los dos valores indicados arriba.

4. Aplica las migraciones e importa el CSV:

   ```bash
   pnpm exec supabase db reset
   ```

   En PowerShell, usa `pnpm.cmd` en lugar de `pnpm` si la política de ejecución bloquea `pnpm.ps1`. El script de configuración usa Node y funciona tanto en Windows como en Unix.

### Ejecutar la aplicación

Inicia Supabase y el servidor de desarrollo de Next.js juntos:

```bash
pnpm dev
```

Esto ejecuta `supabase start` y `next dev` en paralelo. Abre [http://localhost:3000](http://localhost:3000) cuando ambos servicios estén listos.

Para ejecutar los servicios por separado:

```bash
pnpm dev:supabase   # Iniciar Supabase local (Docker)
pnpm dev:next       # Iniciar solo Next.js
```

### Otros comandos

```bash
pnpm setup:env   # Iniciar Supabase y escribir .env.local
pnpm build      # Compilación de producción
pnpm start      # Servidor de producción
pnpm lint       # Ejecutar ESLint
pnpm test       # Ejecutar pruebas en modo watch
pnpm test:run   # Ejecutar pruebas una vez
```

---

## Ejercicio (Español)

Después de completar la configuración, construye una funcionalidad que cargue el conjunto de datos de salud y café en Supabase y lo muestre en una tabla con filtros en la aplicación Next.js.

### Conjunto de datos

El archivo `data/synthetic_coffee_health_10000.csv` contiene **10,000 filas** de datos sintéticos sobre salud y consumo de café. Cada fila tiene estas columnas:

| Columna | Tipo |
| --- | --- |
| `ID` | entero |
| `Age` | entero |
| `Gender` | texto |
| `Country` | texto |
| `Coffee_Intake` | decimal |
| `Caffeine_mg` | decimal |
| `Sleep_Hours` | decimal |
| `Sleep_Quality` | texto |
| `BMI` | decimal |
| `Heart_Rate` | entero |
| `Stress_Level` | texto |
| `Physical_Activity_Hours` | decimal |
| `Health_Issues` | texto |
| `Occupation` | texto |
| `Smoking` | entero (0 o 1) |
| `Alcohol_Consumption` | entero (0 o 1) |

### Parte 1 — Cargar los datos en Supabase

1. Diseña una tabla (o tablas) en Postgres para almacenar este conjunto de datos. Añade una migración en `supabase/migrations/` y/o un archivo de esquema en `supabase/schemas/`.
2. Carga las 10,000 filas del CSV en tu base de datos local. Puedes usar cualquier enfoque razonable — por ejemplo, un script de seed, un script de carga puntual o `COPY` de Postgres.
3. Aplica los cambios localmente:

   ```bash
   pnpx supabase db reset   # ejecuta migraciones y seed.sql
   ```

   O ejecuta solo los pasos que necesites (`supabase migration up`, script de importación personalizado, etc.).

4. Verifica que el conteo de filas en la base de datos coincida con el CSV (10,000 filas).

El proyecto inicial incluye una tabla de ejemplo `notes` y helpers de cliente Supabase en `lib/supabase/`. Puedes conservarlos, reemplazarlos o extenderlos según prefieras.

### Parte 2 — Mostrar una tabla con filtros en Next.js

Construye una página en la aplicación Next.js que muestre los datos cargados en una tabla y permita filtrarlos.

Como mínimo, implementa filtros sobre algunas columnas relevantes — por ejemplo, país, género, calidad del sueño, nivel de estrés o rangos numéricos (edad, consumo de café, IMC). Tú decides qué filtros son más útiles y cómo deben comportarse (coincidencia exacta, selección múltiple, mínimo/máximo, etc.).

Hay componentes de UI disponibles en `components/ui/` (incluidos `table`, `input`, `button` y otros). Úsalos o reemplázalos por los tuyos.

### Parte 3 — Piensa en la escala

10,000 filas es poco para Postgres, pero suficiente para exponer patrones ingenuos en la UI y en las consultas. **Diseña pensando en la escala** — asume que el conjunto de datos podría crecer a cientos de miles o millones de filas.

Documenta cualquier compromiso o supuesto en tu entrega. Nos interesa cómo razonas sobre el rendimiento, no una biblioteca concreta.

### Uso de IA

El desarrollo asistido por IA es bienvenido. Puedes usar asistentes de código, chatbots u otras herramientas de IA mientras trabajas en este ejercicio.

Durante la revisión, asumiremos que entiendes tu entrega y que puedes explicar tu enfoque — por qué tomaste ciertas decisiones, cómo funciona la solución y qué compromisos consideraste. Usa la IA como te ayude, pero asegúrate de que podrías repasar el código con nosotros sin depender de ella.

### Qué entregar

- Configuración local funcional: datos cargados, tabla visible en [http://localhost:3000](http://localhost:3000) (o en una ruta que añadas).
- Notas breves sobre tu esquema, enfoque de importación, estrategia de filtrado y decisiones de escala.
