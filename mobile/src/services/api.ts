export interface SourceRef {
  name: string;
  link: string;
  country: string;
}

export interface NewsArticle {
  id: string;
  source_id: number;
  source_name: string;
  country: string;
  original_language: string;
  default_category: string;
  category: string;
  title: string;
  title_es: string;
  summary: string;
  summary_es: string;
  link: string;
  image_url: string | null;
  pub_date: string;
  related_sources_count: number;
  other_sources: SourceRef[];
}

const API_BASE_URL = "https://globalnews-api-g582.onrender.com/api";

export async function fetchCategories(): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`${API_BASE_URL}/categories`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      return data.categories || getLocalCategories();
    }
  } catch (error) {
    console.warn("Usando categorías locales:", error);
  }
  return getLocalCategories();
}

function getLocalCategories(): string[] {
  return [
    "Todas", "De La Espriella", "Política Colombia", "Bogotá", "Medellín", 
    "Cali", "Barranquilla", "Colombia & Huila", "Latinoamérica", "Vaticano & Fe", 
    "Innovación e IA", "Electricidad & Automatización", "Animales", "Espacio", 
    "Universidades", "Empresas", "Liderazgo", "Política", "Ciencia", 
    "Tecnología", "Deportes", "Moda", "Arte", "Economía", "Salud", 
    "Entretenimiento", "Medio Ambiente"
  ];
}

export async function fetchNews(category: string = "Todas", query: string = ""): Promise<NewsArticle[]> {
  try {
    const params = new URLSearchParams();
    if (category !== "Todas") params.append("category", category);
    if (query) params.append("q", query);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`${API_BASE_URL}/news?${params.toString()}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.articles && data.articles.length > 0) {
        return data.articles;
      }
    }
  } catch (error) {
    console.warn("Servidor en nube actualizando, mostrando feed local:", error);
  }
  return getMockNews(category, query);
}

function getMockNews(selectedCategory: string, query: string = ""): NewsArticle[] {
  const allMocks: NewsArticle[] = [
    {
      id: "news-demo-1",
      source_id: 11,
      source_name: "Diario La Nación Huila",
      country: "Colombia",
      original_language: "es",
      default_category: "Colombia & Huila",
      category: "Colombia & Huila",
      title: "Huila impulsa megaproyecto de energía solar y desarrollo agrícola en Neiva",
      title_es: "Huila impulsa megaproyecto de energía solar y desarrollo agrícola en Neiva",
      summary: "La gobernación del Huila aprueba inversión histórica para modernizar la infraestructura energética del departamento.",
      summary_es: "La gobernación del Huila aprueba inversión histórica para modernizar la infraestructura energética del departamento.",
      link: "https://lanacion.com.co",
      image_url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
      pub_date: "Hace 10 min",
      related_sources_count: 3,
      other_sources: [
        { name: "El Tiempo Colombia", link: "https://www.eltiempo.com", country: "Colombia" }
      ]
    },
    {
      id: "news-demo-2",
      source_id: 6,
      source_name: "Vatican News Español",
      country: "Vaticano",
      original_language: "es",
      default_category: "Vaticano & Fe",
      category: "Vaticano & Fe",
      title: "El Papa Francisco pide unidad global y paz en su nuevo mensaje apostólico",
      title_es: "El Papa Francisco pide unidad global y paz en su nuevo mensaje apostólico",
      summary: "Desde la Santa Sede, el Santo Padre hace un llamado a los líderes mundiales para fortalecer el diálogo y la solidaridad.",
      summary_es: "Desde la Santa Sede, el Santo Padre hace un llamado a los líderes mundiales para fortalecer el diálogo y la solidaridad.",
      link: "https://www.vaticannews.va/es.html",
      image_url: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=800&q=80",
      pub_date: "Hace 20 min",
      related_sources_count: 4,
      other_sources: [
        { name: "ACI Prensa", link: "https://www.aciprensa.com", country: "Vaticano" }
      ]
    },
    {
      id: "news-demo-3",
      source_id: 21,
      source_name: "MIT Tech Review",
      country: "EEUU",
      original_language: "en",
      default_category: "Innovación e IA",
      category: "Innovación e IA",
      title: "Nuevos modelos de Inteligencia Artificial logran razonamiento lógico avanzado",
      title_es: "Nuevos modelos de Inteligencia Artificial logran razonamiento lógico avanzado",
      summary: "Investigadores desarrollan arquitecturas de redes neuronales capaces de resolver teoremas complejos con alta precisión.",
      summary_es: "Investigadores desarrollan arquitecturas de redes neuronales capaces de resolver teoremas complejos con alta precisión.",
      link: "https://www.technologyreview.com",
      image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      pub_date: "Hace 30 min",
      related_sources_count: 5,
      other_sources: [
        { name: "Wired AI", link: "https://www.wired.com", country: "EEUU" }
      ]
    },
    {
      id: "news-demo-4",
      source_id: 16,
      source_name: "IEEE Spectrum",
      country: "EEUU",
      original_language: "en",
      default_category: "Electricidad & Automatización",
      category: "Electricidad & Automatización",
      title: "Avances en redes eléctricas inteligentes y sistemas de automatización industrial PLC",
      title_es: "Avances en redes eléctricas inteligentes y sistemas de automatización industrial PLC",
      summary: "Ingenieros presentan controladores programables de alta velocidad para optimizar redes de distribución de energía.",
      summary_es: "Ingenieros presentan controladores programables de alta velocidad para optimizar redes de distribución de energía.",
      link: "https://spectrum.ieee.org",
      image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      pub_date: "Hace 40 min",
      related_sources_count: 3,
      other_sources: [
        { name: "Automation World", link: "https://www.automationworld.com", country: "EEUU" }
      ]
    },
    {
      id: "news-demo-5",
      source_id: 67,
      source_name: "Vogue Magazine",
      country: "EEUU",
      original_language: "en",
      default_category: "Moda",
      category: "Moda",
      title: "Semana de la Moda de París 2026: Las nuevas tendencias de alta costura",
      title_es: "Semana de la Moda de París 2026: Las nuevas tendencias de alta costura",
      summary: "Los diseñadores presentan colecciones sostenibles con tejidos reciclados y siluetas vanguardistas.",
      summary_es: "Los diseñadores presentan colecciones sostenibles con tejidos reciclados y siluetas vanguardistas.",
      link: "https://www.vogue.com",
      image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      pub_date: "Hace 50 min",
      related_sources_count: 2,
      other_sources: [
        { name: "Elle Magazine", link: "https://www.elle.com", country: "EEUU" }
      ]
    }
  ];

  let filtered = allMocks;
  if (selectedCategory && selectedCategory !== "Todas") {
    filtered = allMocks.filter(m => m.category === selectedCategory);
  }
  if (query) {
    const qLower = query.toLowerCase();
    filtered = filtered.filter(m => m.title_es.toLowerCase().includes(qLower) || m.summary_es.toLowerCase().includes(qLower));
  }
  return filtered;
}
