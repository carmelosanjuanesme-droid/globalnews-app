import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { CategoryBar } from '../components/CategoryBar';
import { NewsCard } from '../components/NewsCard';
import { NewsDetailModal } from '../components/NewsDetailModal';
import { fetchCategories, fetchNews, NewsArticle } from '../services/api';

export const NewsFeedScreen: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    loadCategories();
    loadNews('Todas', '');
  }, []);

  const loadCategories = async () => {
    const cats = await fetchCategories();
    setCategories(cats);
  };

  const loadNews = async (cat: string, query: string) => {
    setLoading(true);
    const articles = await fetchNews(cat, query);
    setNews(articles);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const articles = await fetchNews(selectedCategory, searchQuery);
    setNews(articles);
    setRefreshing(false);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    loadNews(cat, searchQuery);
  };

  const handleSearchSubmit = () => {
    loadNews(selectedCategory, searchQuery);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra superior de título y buscador */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.titleText}>GlobalNews</Text>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>120 Fuentes Al Día</Text>
          </View>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar noticias, arte, moda, política..."
          placeholderTextColor="#71717a"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
        />
      </View>

      {/* Categorías deslizantes */}
      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
      />

      {/* Lista de noticias */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>
            Procesando y desduplicando 120 fuentes del mundo...
          </Text>
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NewsCard
              article={item}
              onPress={(art) => setSelectedArticle(art)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#3b82f6"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No se encontraron noticias en "{selectedCategory}"
              </Text>
            </View>
          }
        />
      )}

      {/* Modal para ver la noticia completa */}
      <NewsDetailModal
        visible={selectedArticle !== null}
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#121214',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveBadge: {
    backgroundColor: '#166534',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveBadgeText: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '700',
  },
  searchInput: {
    backgroundColor: '#1e1e24',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2d2d35',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#a1a1aa',
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#71717a',
    fontSize: 15,
  },
});
