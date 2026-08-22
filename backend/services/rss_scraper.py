import asyncio
import feedparser
import re
import urllib.parse
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional

def extract_image_url(entry: Dict[str, Any], html_content: str = "") -> Optional[str]:
    """
    Extrae la URL de la imagen u ilustración original de la entrada RSS
    utilizando varias heurísticas (media:content, enclosures, og:image o HTML img tags).
    """
    # 1. Media content (usado por la mayoría de medios internacionales)
    if "media_content" in entry and entry["media_content"]:
        for media in entry["media_content"]:
            if "url" in media:
                return media["url"]
    
    if "media_thumbnail" in entry and entry["media_thumbnail"]:
        for media in entry["media_thumbnail"]:
            if "url" in media:
                return media["url"]
                
    # 2. Enclosures
    if "enclosures" in entry and entry["enclosures"]:
        for enclosure in entry["enclosures"]:
            if enclosure.get("type", "").startswith("image/") and "href" in enclosure:
                return enclosure["href"]

    # 3. Extraer primera imagen del contenido HTML o resumen
    content_to_search = html_content or entry.get("summary", "") or entry.get("description", "")
    if content_to_search:
        soup = BeautifulSoup(content_to_search, "html.parser")
        img_tag = soup.find("img")
        if img_tag and img_tag.get("src"):
            src = img_tag["src"]
            if src.startswith("http://") or src.startswith("https://"):
                return src

    return None

def clean_html(text: str) -> str:
    """Limpia etiquetas HTML no deseadas del resumen de la noticia."""
    if not text:
        return ""
    soup = BeautifulSoup(text, "html.parser")
    clean_text = soup.get_text(separator=" ").strip()
    return re.sub(r'\s+', ' ', clean_text)

async def fetch_feed(source: Dict[str, Any], timeout_seconds: int = 8) -> List[Dict[str, Any]]:
    """Obtiene y procesa las noticias de una sola fuente RSS."""
    feed_url = source["url"]
    loop = asyncio.get_event_loop()
    
    try:
        # Ejecutar feedparser en un hilo para no bloquear el bucle de eventos
        feed = await loop.run_in_executor(None, feedparser.parse, feed_url)
        
        parsed_articles = []
        for entry in feed.entries[:10]: # Limitar a las 10 noticias más recientes por fuente
            title = entry.get("title", "").strip()
            link = entry.get("link", "").strip()
            summary_raw = entry.get("summary", "") or entry.get("description", "")
            summary = clean_html(summary_raw)
            pub_date = entry.get("published", "") or entry.get("updated", "")
            
            image_url = extract_image_url(entry, summary_raw)
            
            if not title or not link:
                continue

            parsed_articles.append({
                "source_id": source["id"],
                "source_name": source["name"],
                "country": source["country"],
                "original_language": source["language"],
                "default_category": source["category"],
                "title": title,
                "summary": summary[:400] + ("..." if len(summary) > 400 else ""),
                "link": link,
                "image_url": image_url,
                "pub_date": pub_date
            })
            
        return parsed_articles
    except Exception as e:
        print(f"Error parseando fuente {source['name']} ({feed_url}): {e}")
        return []

async def fetch_all_sources(sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Obtiene noticias en paralelo de las 120 fuentes de noticias."""
    tasks = [fetch_feed(source) for source in sources]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    all_articles = []
    for res in results:
        if isinstance(res, list):
            all_articles.extend(res)
            
    return all_articles
