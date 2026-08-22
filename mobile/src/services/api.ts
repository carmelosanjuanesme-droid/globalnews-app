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
    const response = await fetch(`${API_BASE_URL}/categories`);
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.warn("Usando categorías locales de respaldo:", error);
    return [
      "Todas", "Política", "Ciencia", "Tecnología", "Deportes", 
      "Moda", "Arte", "Economía", "Salud", "Entretenimiento", "Medio Ambiente"
    ];
  }
}

export async function fetchNews(category: string = "Todas", query: string = ""): Promise<NewsArticle[]> {
  try {
    const params = new URLSearchParams();
    if (category !== "Todas") params.append("category", category);
    if (query) params.append("q", query);

    const response = await fetch(`${API_BASE_URL}/news?${params.toString()}`);
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.warn("Usando datos de demostración de respaldo:", error);
    return getMockNews(category);
  }
}

// Datos de respaldo con imágenes e ilustraciones reales para vista previa instantánea
function getMockNews(selectedCategory: string): NewsArticle[] {
  const allMocks: NewsArticle[] = [
    {
      id: "news-demo-1",
      source_id: 67,
      source_name: "Vogue Magazine",
      country: "EEUU",
      original_language: "en",
      default_category: "Moda",
      category: "Moda",
      title: "Paris Fashion Week 2026: The New Trends for Autumn/Winter",
      title_es: "Semana de la Moda de París 2026: Las nuevas tendencias para otoño/invierno",
      summary: "High fashion designers present revolutionary sustainable collections on the Paris runways using recycled fabrics and futuristic silhouettes.",
      summary_es: "Los diseñadores de alta costura presentan revolucionarias colecciones sostenibles en las pasarelas de París utilizando tejidos reciclados y siluetas futuristas.",
      link: "https://www.vogue.com",
      image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      pub_date: "Hace 15 min",
      related_sources_count: 3,
      other_sources: [
        { name: "Elle Magazine", link: "https://www.elle.com", country: "EEUU" },
        { name: "El País S Moda", link: "https://smoda.elpais.com", country: "España" }
      ]
    },
    {
      id: "news-demo-2",
      source_id: 84,
      source_name: "NASA News",
      country: "EEUU",
      original_language: "en",
      default_category: "Ciencia",
      category: "Ciencia",
      title: "James Webb Telescope Discovers New Exoplanet with Atmosphere",
      title_es: "El telescopio James Webb descubre un nuevo exoplaneta con atmósfera habitable",
      summary: "Astronomers have detected atmospheric water vapor signatures on an Earth-sized planet located 40 light-years away.",
      summary_es: "Los astrónomos han detectado señales de vapor de agua atmosférico en un planeta del tamaño de la Tierra ubicado a 40 años luz.",
      link: "https://www.nasa.gov",
      image_url: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80",
      pub_date: "Hace 30 min",
      related_sources_count: 5,
      other_sources: [
        { name: "Nature News", link: "https://www.nature.com", country: "Internacional" },
        { name: "ScienceDaily", link: "https://www.sciencedaily.com", country: "EEUU" }
      ]
    },
    {
      id: "news-demo-3",
      source_id: 74,
      source_name: "Artforum",
      country: "EEUU",
      original_language: "en",
      default_category: "Arte",
      category: "Arte",
      title: "Venice Biennale 2026 Announces Golden Lion Award Winners",
      title_es: "La Bienal de Venecia 2026 anuncia los ganadores del León de Oro en Arte Contemporáneo",
      summary: "The international jury awards top honours to groundbreaking digital sculptures and immersive room installations.",
      summary_es: "El jurado internacional otorga los máximos honores a esculturas digitales innovadoras e instalaciones de salas inmersivas.",
      link: "https://www.artforum.com",
      image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
      pub_date: "Hace 45 min",
      related_sources_count: 2,
      other_sources: [
        { name: "The Art Newspaper", link: "https://www.theartnewspaper.com", country: "Reino Unido" }
      ]
    },
    {
      id: "news-demo-4",
      source_id: 2,
      source_name: "BBC News World",
      country: "Reino Unido",
      original_language: "en",
      default_category: "Política",
      category: "Política",
      title: "Global Summit Agrees on Historic Climate Protection Pact",
      title_es: "La Cumbre Mundial acuerda un pacto histórico de protección climática internacional",
      summary: "World leaders from 190 countries sign a binding agreement to accelerate transition to renewable energy sources.",
      summary_es: "Líderes mundiales de 190 países firman un acuerdo vinculante para acelerar la transición a fuentes de energía renovable.",
      link: "https://www.bbc.com/news",
      image_url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      pub_date: "Hace 1 hora",
      related_sources_count: 8,
      other_sources: [
        { name: "Reuters World", link: "https://www.reuters.com", country: "Internacional" },
        { name: "El País", link: "https://elpais.com", country: "España" },
        { name: "France 24", link: "https://www.france24.com", country: "Francia" }
      ]
    },
    {
      id: "news-demo-5",
      source_id: 92,
      source_name: "Marca.com",
      country: "España",
      original_language: "es",
      default_category: "Deportes",
      category: "Deportes",
      title: "La Champions League entra en su fase decisiva con partidos electrizantes",
      title_es: "La Champions League entra en su fase decisiva con partidos electrizantes",
      summary: "Los principales clubes del continente europeo se enfrentan en los cuartos de final de la máxima competición internacional.",
      summary_es: "Los principales clubes del continente europeo se enfrentan en los cuartos de final de la máxima competición internacional.",
      link: "https://www.marca.com",
      image_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
      pub_date: "Hace 2 horas",
      related_sources_count: 4,
      other_sources: [
        { name: "L'Équipe", link: "https://www.lequipe.fr", country: "Francia" },
        { name: "La Gazzetta dello Sport", link: "https://www.gazzetta.it", country: "Italia" }
      ]
    }
  ];

  if (selectedCategory === "Todas") {
    return allMocks;
  }
  return allMocks.filter(m => m.category === selectedCategory);
}
