# Sistema de Búsqueda Distribuido con Solr

Este proyecto implementa un sistema completo de búsqueda y recuperación de información utilizando Apache Solr, Node.js, React y Python.

## Arquitectura

El sistema sigue una arquitectura de microservicios orquestada con Docker Compose:

- **Solr**: Motor de búsqueda configurado para español (Stemming, Sinónimos, Stopwords).
- **Backend**: API Node.js con arquitectura hexagonal.
- **Frontend**: SPA React moderna con TailwindCSS.
- **Crawler**: Servicio Flask (Python) para indexar contenido web y documentos (PDF/Office) vía Apache Tika.
- **Tika**: Servicio de extracción de texto y metadatos.

## Requisitos

- Docker y Docker Compose
- Node.js 18+ (opcional para desarrollo local)
- Python 3.9+ (opcional para desarrollo local)

## Instalación y Ejecución

### 1. Iniciar los servicios

Ejecutar el siguiente comando en la raíz del proyecto para levantar Solr, Tika, Backend, Frontend y Crawler:

```bash
docker-compose up --build -d
```

Esto iniciará:
- Solr en `http://localhost:8983`
- Tika en `http://localhost:9998`
- Backend en `http://localhost:5001`
- Frontend en `http://localhost:5173`
- Crawler en `http://localhost:5000` (interno)

### 2. Verificar Solr

Acceder a `http://localhost:8983/solr` y verificar que el core `search_core` esté creado.

### 3. Gestión del Crawler

El crawler funciona como un servicio bajo demanda.

**Gestión de Semillas (URLs):**
1. En la interfaz web, hacer clic en **"Manage Seeds"**.
2. Editar la lista de URLs objetivo (una por línea).
3. Guardar los cambios.

**Ejecutar Indexación:**
1. En el modal "Manage Seeds", hacer clic en **"Run Crawler"**.
2. El sistema mostrará el estado "Crawling..." mientras procesa las URLs.
3. Al finalizar, se notificará en la interfaz.

### 4. Usar el Buscador

1. Abrir `http://localhost:5173` en el navegador.
2. **Búsqueda**: Escribir términos como "Solr", "Buscador".
3. **Funcionalidades**:
   - **Subir Archivo**: Hacer clic en "Upload Document" para indexar PDFs o DOCX locales.
   - **Limpiar Índice**: Hacer clic en "Clear Index" para eliminar todos los documentos (requiere confirmación).
   - **Filtros (Facetas)**: Usar la barra lateral para filtrar por categoría o tipo de archivo.
   - **Corrector Ortográfico**: El sistema sugiere correcciones automáticas (ej. "vulmerabilidades" -> "vulnerabilidades").
   - **Autocompletado**: Visualizar sugerencias en tiempo real al escribir.

## Estructura del Proyecto

```
/
├── backend/            # API Node.js (Hexagonal)
├── crawler/            # Servicio Flask + Scrapy/Requests
├── frontend/           # React + Vite + TailwindCSS
├── solr/               # Configuración de Solr (Schema, Synonyms)
└── docker-compose.yml  # Orquestación de servicios
```

## Notas de Desarrollo

- **Solr Schema**: Definido en `solr/configsets/search_config/conf/managed-schema.xml`.
- **Synonyms**: Editar `solr/configsets/search_config/conf/synonyms.txt` y reiniciar Solr.
- **Backend Logic**: La lógica de búsqueda reside en `backend/src/domain/SearchService.js`.

