import re
from typing import List, Dict, Any
from collections import defaultdict

def normalize_text(text: str) -> set:
    """Convierte texto a un conjunto de palabras clave normalizadas sin stop-words."""
    text_clean = re.sub(r'[^\w\s]', '', text.lower())
    stopwords = {
        "el", "la", "los", "las", "un", "una", "unos", "unas", "y", "o", "pero", 
        "de", "del", "a", "en", "para", "por", "con", "sin", "sobre", "tras", 
        "que", "se", "su", "sus", "the", "a", "an", "and", "or", "but", "in", 
        "on", "at", "to", "for", "of", "with", "by", "from", "up", "about", "into"
    }
    words = set(text_clean.split())
    return words - stopwords

def jaccard_similarity(set1: set, set2: set) -> float:
    """Calcula el coeficiente de similitud de Jaccard entre dos conjuntos de palabras."""
    if not set1 or not set2:
        return 0.0
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    return intersection / union if union > 0 else 0.0

def deduplicate_news(articles: List[Dict[str, Any]], similarity_threshold: float = 0.40) -> List[Dict[str, Any]]:
    """
    Agrupa noticias que hablen del mismo suceso o evento mundial.
    Retorna una lista de noticias únicas desduplicadas con referencia a las fuentes secundarias.
    """
    if not articles:
        return []

    clusters = []
    
    for article in articles:
        title_to_use = article.get("title_es", article.get("title", ""))
        article_words = normalize_text(title_to_use)
        
        merged = False
        for cluster in clusters:
            primary_article = cluster["primary"]
            primary_title = primary_article.get("title_es", primary_article.get("title", ""))
            primary_words = normalize_text(primary_title)
            
            similarity = jaccard_similarity(article_words, primary_words)
            
            if similarity >= similarity_threshold:
                # La noticia trata sobre el mismo evento, la añadimos a fuentes secundarias
                cluster["sources"].append({
                    "name": article["source_name"],
                    "link": article["link"],
                    "country": article["country"]
                })
                # Si la nueva noticia tiene una mejor imagen, la actualizamos
                if not primary_article.get("image_url") and article.get("image_url"):
                    primary_article["image_url"] = article["image_url"]
                merged = True
                break
                
        if not merged:
            clusters.append({
                "primary": article,
                "sources": [{
                    "name": article["source_name"],
                    "link": article["link"],
                    "country": article["country"]
                }]
            })
            
    # Formatear la lista de retorno
    deduplicated_list = []
    for idx, cluster in enumerate(clusters):
        item = cluster["primary"].copy()
        item["id"] = f"news-{idx+1}"
        item["related_sources_count"] = len(cluster["sources"])
        item["other_sources"] = [s for s in cluster["sources"] if s["link"] != item["link"]]
        deduplicated_list.append(item)
        
    return deduplicated_list
