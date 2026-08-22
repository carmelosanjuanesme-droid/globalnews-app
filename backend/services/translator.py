import asyncio
from typing import List, Dict, Any

try:
    from deep_translator import GoogleTranslator
    HAS_DEEP_TRANSLATOR = True
except ImportError:
    HAS_DEEP_TRANSLATOR = False

async def translate_text(text: str, target_lang: str = "es", source_lang: str = "auto") -> str:
    """Traduce un texto al español usando deep-translator con fallback gracioso."""
    if not text or source_lang == "es":
        return text
        
    if HAS_DEEP_TRANSLATOR:
        try:
            loop = asyncio.get_event_loop()
            translated = await loop.run_in_executor(
                None, 
                lambda: GoogleTranslator(source=source_lang, target=target_lang).translate(text)
            )
            return translated if translated else text
        except Exception as e:
            print(f"Error en traducción: {e}")
            return text
    else:
        return text

async def translate_articles_in_batch(articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Traduce en paralelo los titulares y resúmenes de los artículos que no estén en español."""
    translated_articles = []
    
    for article in articles:
        if article.get("original_language") != "es":
            # Traducir título y resumen
            translated_title = await translate_text(article["title"], source_lang=article.get("original_language", "auto"))
            translated_summary = await translate_text(article["summary"], source_lang=article.get("original_language", "auto"))
            
            article["title_es"] = translated_title
            article["summary_es"] = translated_summary
        else:
            article["title_es"] = article["title"]
            article["summary_es"] = article["summary"]
            
        translated_articles.append(article)
        
    return translated_articles
