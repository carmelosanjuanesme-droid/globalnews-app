import re
from typing import Dict, Any

CATEGORY_KEYWORDS = {
    "Moda": [
        "moda", "fashion", "vogue", "estilo", "style", "pasarela", "runway", "designer", 
        "diseñador", "vestido", "dress", "haute couture", "alta costura", "supermodel", 
        "colección", "desfile", "ropa", "tendencia"
    ],
    "Arte": [
        "arte", "art", "exposición", "exhibition", "museo", "museum", "pintura", "painting", 
        "escultura", "sculpture", "galería", "gallery", "cine", "música", "music", "teatro", 
        "literatura", "novela", "arquitectura", "design", "fotografía"
    ],
    "Ciencia": [
        "ciencia", "science", "investigación", "research", "estudio", "study", "espacio", 
        "space", "nasa", "astronomía", "física", "química", "biología", "genética", "descubrimiento", 
        "telescopio", "planeta", "marte", "luna", "científicos"
    ],
    "Tecnología": [
        "tecnología", "technology", "tech", "ia", "ai", "inteligencia artificial", "artificial intelligence", 
        "apple", "google", "microsoft", "smartphone", "software", "robot", "ciberseguridad", 
        "app", "cripto", "bitcoin", "redes sociales"
    ],
    "Deportes": [
        "deportes", "sports", "fútbol", "football", "soccer", "baloncesto", "basketball", 
        "tenis", "fórmula 1", "f1", "champions league", "olimpíadas", "olympics", "gol", 
        "partido", "jugador", "equipo", "campeonato"
    ],
    "Política": [
        "política", "politics", "gobierno", "government", "presidente", "president", "elecciones", 
        "elections", "parlamento", "senado", "congreso", "diplomacia", "guerra", "paz", "tratado", 
        "unión europea", "onu", "ley"
    ],
    "Economía": [
        "economía", "economy", "finanzas", "finance", "mercado", "market", "bolsa", "stocks", 
        "inflación", "banco central", "dólar", "euro", "empresa", "negocios", "inversión"
    ],
    "Salud": [
        "salud", "health", "medicina", "medicine", "virus", "vacuna", "vaccine", "enfermedad", 
        "hospital", "tratamiento", "nutrición", "estudio médico", "oms", "who"
    ],
    "Medio Ambiente": [
        "medio ambiente", "environment", "clima", "climate", "cambio climático", "climate change", 
        "ecología", "biodiversidad", "reciclaje", "planeta", "sostenible", "bosques", "océano"
    ],
    "Entretenimiento": [
        "entretenimiento", "entertainment", "hollywood", "película", "movie", "serie", "tv", 
        "celebridad", "celebrity", "actor", "actriz", "grammy", "oscar", "streaming", "netflix"
    ]
}

def classify_article(article: Dict[str, Any]) -> str:
    """Clasifica el artículo en una categoría refinada basándose en titulares y la fuente."""
    default_cat = article.get("default_category", "Política")
    
    text = (article.get("title_es", "") + " " + article.get("summary_es", "") + " " + article.get("title", "")).lower()
    
    # Evaluar puntuaciones de coincidencia de palabras clave
    category_scores = {}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for word in keywords if re.search(r'\b' + re.escape(word) + r'\b', text))
        if score > 0:
            category_scores[cat] = score
            
    if category_scores:
        best_cat = max(category_scores, key=category_scores.get)
        return best_cat
        
    return default_cat
