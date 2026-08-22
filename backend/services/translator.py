import asyncio
from typing import List, Dict, Any

try:
    from deep_translator import GoogleTranslator
    HAS_DEEP_TRANSLATOR = True
except ImportError:
    HAS_DEEP_TRANSLATOR = False

async def translate_single_article(article: Dict[str, Any]) -> Dict[str, Any]:
    """Traduce un artículo al español si no está en español."""
    art = article.copy()
    orig_lang = art.get("original_language", "auto")
    
    if orig_lang == "es":
        art["title_es"] = art["title"]
        art["summary_es"] = art["summary"]
        return art
        
    if HAS_DEEP_TRANSLATOR:
        try:
            loop = asyncio.get_event_loop()
            # Traducir título
            t_title = await loop.run_in_executor(
                None, 
                lambda: GoogleTranslator(source=orig_lang, target="es").translate(art["title"][:250])
            )
            art["title_es"] = t_title if t_title else art["title"]
        except Exception:
            art["title_es"] = art["title"]
            
        try:
            loop = asyncio.get_event_loop()
            # Traducir resumen corto
            t_summary = await loop.run_in_executor(
                None, 
                lambda: GoogleTranslator(source=orig_lang, target="es").translate(art["summary"][:300])
            )
            art["summary_es"] = t_summary if t_summary else art["summary"]
        except Exception:
            art["summary_es"] = art["summary"]
    else:
        art["title_es"] = art["title"]
        art["summary_es"] = art["summary"]
        
    return art

async def translate_articles_in_batch(articles: List[Dict[str, Any]], max_concurrent: int = 20) -> List[Dict[str, Any]]:
    """Traduce noticias en paralelo ultrarrápido con semáforo de concurrencia."""
    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def sem_translate(article):
        async with semaphore:
            return await translate_single_article(article)
            
    tasks = [sem_translate(art) for art in articles]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    translated = []
    for r in results:
        if isinstance(r, dict):
            translated.append(r)
            
    return translated
