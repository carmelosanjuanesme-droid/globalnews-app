import json
import os
import sys
import asyncio
from typing import List, Optional
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Asegurar que el directorio backend esté en sys.path
backend_dir = os.path.dirname(__file__)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from services.rss_scraper import fetch_all_sources
    from services.translator import translate_articles_in_batch
    from services.deduplicator import deduplicate_news
    from services.classifier import classify_article
except ImportError:
    from backend.services.rss_scraper import fetch_all_sources
    from backend.services.translator import translate_articles_in_batch
    from backend.services.deduplicator import deduplicate_news
    from backend.services.classifier import classify_article


app = FastAPI(title="GlobalNews API", version="1.0.0")

# Permitir solicitudes CORS desde la app móvil
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar configuración de 120 fuentes
SOURCES_FILE = os.path.join(os.path.dirname(__file__), "config", "sources.json")

def load_sources():
    if os.path.exists(SOURCES_FILE):
        with open(SOURCES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

SOURCES = load_sources()
CATEGORIES = [
    "Todas", "Política", "Ciencia", "Tecnología", "Deportes", 
    "Moda", "Arte", "Economía", "Salud", "Entretenimiento", "Medio Ambiente"
]

# Caché en memoria de noticias procesadas
NEWS_CACHE = {
    "articles": [],
    "last_updated": None
}

async def refresh_news_cache():
    """Obtiene, traduce, desduplica y clasifica noticias de las 120 fuentes."""
    print("Iniciando actualización de noticias desde 120 fuentes...")
    raw_articles = await fetch_all_sources(SOURCES)
    print(f"Obtenidos {len(raw_articles)} artículos brutos.")
    
    # 1. Traducir al español si proviene de otro idioma
    translated = await translate_articles_in_batch(raw_articles)
    
    # 2. Clasificar categoría
    for art in translated:
        art["category"] = classify_article(art)
        
    # 3. Desduplicar noticias idénticas
    deduplicated = deduplicate_news(translated)
    
    NEWS_CACHE["articles"] = deduplicated
    NEWS_CACHE["last_updated"] = asyncio.get_event_loop().time()
    print(f"Caché actualizada con {len(deduplicated)} noticias únicas desduplicadas.")

@app.on_event("startup")
async def startup_event():
    # Cargar primera tanda de noticias en segundo plano
    asyncio.create_task(refresh_news_cache())

@app.get("/")
def read_root():
    return {"message": "API de Noticias Globales activa. 120 Fuentes integradas."}

@app.get("/api/categories")
def get_categories():
    return {"categories": CATEGORIES}

@app.get("/api/sources")
def get_sources():
    return {"total_sources": len(SOURCES), "sources": SOURCES}

@app.get("/api/news")
def get_news(
    category: Optional[str] = Query("Todas"),
    q: Optional[str] = Query(None),
    limit: int = Query(50)
):
    articles = NEWS_CACHE["articles"]
    
    # Filtrar por categoría
    if category and category != "Todas":
        articles = [a for a in articles if a.get("category") == category]
        
    # Filtrar por término de búsqueda
    if q:
        query_lower = q.lower()
        articles = [
            a for a in articles 
            if query_lower in a.get("title_es", "").lower() or query_lower in a.get("summary_es", "").lower()
        ]
        
    return {
        "count": len(articles[:limit]),
        "total_available": len(articles),
        "articles": articles[:limit]
    }

@app.post("/api/news/refresh")
async def trigger_refresh():
    await refresh_news_cache()
    return {"status": "ok", "message": "Proceso de actualización completado", "total_unique": len(NEWS_CACHE["articles"])}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

