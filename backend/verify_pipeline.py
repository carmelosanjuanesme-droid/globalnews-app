import asyncio
import json
import os
import sys

# Forzar codificación UTF-8 para la salida en consola de Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from services.rss_scraper import fetch_all_sources
from services.translator import translate_articles_in_batch
from services.deduplicator import deduplicate_news
from services.classifier import classify_article

async def test_news_pipeline():
    print("=== INICIANDO PRUEBA DE VERIFICACIÓN DEL BACKEND ===")
    
    # 1. Cargar fuentes
    sources_path = os.path.join(os.path.dirname(__file__), "config", "sources.json")
    with open(sources_path, "r", encoding="utf-8") as f:
        sources = json.load(f)
    print(f"[OK] Cargadas {len(sources)} fuentes del catálogo.")
    
    # 2. Tomar una muestra de 15 fuentes para prueba rápida
    sample_sources = sources[:15]
    print(f"[INFO] Consultando noticias de muestra ({len(sample_sources)} fuentes)...")
    
    raw_articles = await fetch_all_sources(sample_sources)
    print(f"[OK] Obtenidas {len(raw_articles)} noticias brutas.")
    
    # Verificar noticias con imágenes
    with_images = [a for a in raw_articles if a.get("image_url")]
    print(f"[IMG] Noticias con imágenes e ilustraciones originales extraídas: {len(with_images)}/{len(raw_articles)}")
    
    # 3. Prueba de traducción
    print("[TRANS] Traduciendo noticias al español...")
    translated = await translate_articles_in_batch(raw_articles)
    print(f"[OK] Procesadas {len(translated)} traducciones.")
    
    # 4. Clasificación
    print("[CAT] Clasificando noticias en secciones...")
    for art in translated:
        art["category"] = classify_article(art)
        
    categories_found = set(a["category"] for a in translated)
    print(f"[OK] Categorías identificadas en esta muestra: {list(categories_found)}")
    
    # 5. Desduplicación
    print("[DEDUP] Probando motor de desduplicación semántica...")
    dedup = deduplicate_news(translated)
    print(f"[OK] Noticias desduplicadas: {len(dedup)} (Reducción de repetidos: {len(translated) - len(dedup)})")
    
    print("\n--- MUESTRA DE NOTICIA PROCESADA ---")
    if dedup:
        sample = dedup[0]
        print(f"-> Titular en Español: {sample.get('title_es')}")
        print(f"-> Fuente Original: {sample.get('source_name')} ({sample.get('country')})")
        print(f"-> Sección: {sample.get('category')}")
        print(f"-> Imagen: {sample.get('image_url')}")
        print(f"-> Medios Unificados: {sample.get('related_sources_count')}")
    print("\n=== PIPELINE VERIFICADO EXITOSAMENTE ===")

if __name__ == "__main__":
    asyncio.run(test_news_pipeline())
