import asyncio
import httpx
import urllib.parse
from typing import List, Dict, Any

try:
    from deep_translator import GoogleTranslator
    HAS_DEEP_TRANSLATOR = True
except ImportError:
    HAS_DEEP_TRANSLATOR = False

def translate_http_fallback(text: str) -> str:
    """Fallback por HTTP directo utilizando MyMemory / Google web API si deep_translator falla o limita peticiones."""
    if not text:
        return text
    try:
        url = f"https://api.mymemory.translated.net/get?q={urllib.parse.quote(text[:300])}&langpair=autodetect|es"
        response = httpx.get(url, timeout=4.0)
        if response.status_code == 200:
            data = response.json()
            matches = data.get("responseData", {}).get("translatedText", "")
            if matches and matches != text:
                return matches
    except Exception as e:
        print(f"Fallback HTTP error: {e}")
    return text

async def translate_text_robust(text: str, source_lang: str = "auto") -> str:
    """Traduce cualquier texto al español garantizando respuesta mediante deep-translator o fallback HTTP."""
    if not text:
        return ""
        
    # Si la fuente ya está declarada en español y no tiene caracteres raros, omitir
    if source_lang == "es":
        return text
        
    translated_result = text

    # Intentar con deep-translator (GoogleTranslator source="auto" target="es")
    if HAS_DEEP_TRANSLATOR:
        try:
            loop = asyncio.get_event_loop()
            res = await loop.run_in_executor(
                None, 
                lambda: GoogleTranslator(source="auto", target="es").translate(text[:350])
            )
            if res and res.strip() and res.strip() != text.strip():
                return res.strip()
        except Exception as e:
            print(f"Error en GoogleTranslator: {e}")

    # Fallback si falla el primer método
    try:
        loop = asyncio.get_event_loop()
        res_fallback = await loop.run_in_executor(None, translate_http_fallback, text[:300])
        if res_fallback:
            return res_fallback
    except Exception:
        pass

    return translated_result

async def translate_single_article(article: Dict[str, Any]) -> Dict[str, Any]:
    """Procesa y garantiza la traducción al español del titular y del resumen de cada noticia."""
    art = article.copy()
    src_lang = art.get("original_language", "auto")

    # Si es español, asegurarse de asignar los campos _es
    if src_lang == "es":
        art["title_es"] = art["title"]
        art["summary_es"] = art["summary"]
        return art

    # Traducir título al español
    art["title_es"] = await translate_text_robust(art["title"], source_lang=src_lang)
    
    # Traducir resumen al español
    if art.get("summary"):
        art["summary_es"] = await translate_text_robust(art["summary"], source_lang=src_lang)
    else:
        art["summary_es"] = art["title_es"]

    return art

async def translate_articles_in_batch(articles: List[Dict[str, Any]], max_concurrent: int = 15) -> List[Dict[str, Any]]:
    """Procesa en paralelo la traducción de todos los artículos."""
    semaphore = asyncio.Semaphore(max_concurrent)

    async def sem_translate(art):
        async with semaphore:
            return await translate_single_article(art)

    tasks = [sem_translate(article) for article in articles]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    translated = []
    for r in results:
        if isinstance(r, dict):
            translated.append(r)

    return translated
