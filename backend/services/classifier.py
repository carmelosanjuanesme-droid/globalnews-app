import re
from typing import Dict, Any

CATEGORY_KEYWORDS = {
    "De La Espriella": [
        "de la espriella", "abelardo de la espriella", "delaespriella", "espriella lawyers"
    ],
    "Política Colombia": [
        "política colombia", "petro", "gustavo petro", "congreso colombia", "senado colombia", 
        "cámara colombia", "la silla vacía", "cambio colombia", "uribe", "corte constitucional", 
        "fiscalía colombia", "defensoría", "cancillería colombia"
    ],
    "Bogotá": [
        "bogotá", "bogota", "galán", "alcaldía de bogotá", "transmilenio", "metro de bogotá", 
        "cundinamarca", "suba", "usaquén", "engativá", "chapinero"
    ],
    "Medellín": [
        "medellín", "medellin", "antioquia", "fico gutiérrez", "alcaldía de medellín", 
        "metro de medellín", "el poblado", "laureles", "bello", "envigado", "el colombiano"
    ],
    "Cali": [
        "cali", "valle del cauca", "eder", "alcaldía de cali", "mio cali", "el país cali", 
        "jamundí", "yumbo", "palmira", "90 minutos"
    ],
    "Barranquilla": [
        "barranquilla", "atlántico", "char", "alcaldía de barranquilla", "el heraldo", 
        "zona cero", "carnaval de barranquilla", "soledad", "puerto colombia"
    ],
    "Animales": [
        "animales", "animal", "fauna", "mascota", "mascotas", "perro", "gato", "perros", 
        "gatos", "especie", "biodiversidad", "silvestre", "wwf", "animanaturalis", "zoología", "veterinaria"
    ],
    "Espacio": [
        "espacio", "space", "astronomía", "astronomy", "nasa", "esa", "telescopio", "james webb", 
        "hubble", "exoplaneta", "galaxia", "universo", "sistema solar", "marte", "luna", "órbita", "cohete", "spacex"
    ],
    "Universidades": [
        "universidad", "universidades", "universia", "educación superior", "educación", 
        "estudiantes", "campus", "carrera", "becas", "académico", "investigación universitaria", "rector"
    ],
    "Empresas": [
        "empresas", "empresa", "compañía", "negocios", "business", "portafolio", "dinero", 
        "forbes", "bloomberg línea", "sector privado", "multinacional", "startup", "pymes", "inversión privada"
    ],
    "Liderazgo": [
        "liderazgo", "leadership", "management", "gerencia", "líder", "líderes", "estrategia empresarial", 
        "entrepreneur", "harvard business review", "mckinsey", "productividad", "cultura organizacional", "ceo"
    ],
    "Colombia & Huila": [
        "huila", "neiva", "garzón", "pitalito", "opita", "la nación huila", "colombiano"
    ],
    "Latinoamérica": [
        "latinoamérica", "latin america", "américa latina", "venezuela", "méxico", "argentina", 
        "brasil", "chile", "perú", "ecuador", "bolivia", "caribe", "sudamérica"
    ],
    "Vaticano & Fe": [
        "vaticano", "vatican", "papa", "pope", "francisco", "católico", "católica", "iglesia", 
        "fe", "obispo", "santo padre", "evangelio", "misa", "vaticannews", "aciprensa"
    ],
    "Innovación e IA": [
        "inteligencia artificial", "artificial intelligence", "ia", "ai", "chatgpt", "llm", 
        "openai", "gemini", "innovación", "innovation", "algoritmo", "machine learning", "deep learning"
    ],
    "Electricidad & Automatización": [
        "electricidad", "electricity", "energía", "power grid", "electrónica", "electronics", 
        "automatización", "automation", "plc", "scada", "robótica industrial", "circuito", 
        "transformador", "ieee", "voltaje", "corriente", "inversor", "subestación"
    ],
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
        "ciencia", "science", "investigación", "research", "estudio", "study", "física", 
        "química", "biología", "genética", "descubrimiento", "científicos"
    ],
    "Tecnología": [
        "tecnología", "technology", "tech", "apple", "google", "microsoft", "smartphone", 
        "software", "ciberseguridad", "app", "cripto", "bitcoin", "redes sociales"
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
        "inflación", "banco central", "dólar", "euro"
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
    
    category_scores = {}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for word in keywords if re.search(r'\b' + re.escape(word) + r'\b', text))
        if score > 0:
            category_scores[cat] = score
            
    if category_scores:
        best_cat = max(category_scores, key=category_scores.get)
        return best_cat
        
    return default_cat
