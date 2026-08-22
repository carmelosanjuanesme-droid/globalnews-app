import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { NewsArticle } from '../services/api';

interface NewsCardProps {
  article: NewsArticle;
  onPress: (article: NewsArticle) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onPress }) => {
  const displayTitle = article.title_es || article.title;
  const displaySummary = article.summary_es || article.summary;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(article)}
      activeOpacity={0.85}
    >
      {article.image_url ? (
        <Image
          source={{ uri: article.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>📰 {article.source_name}</Text>
        </View>
      )}

      <View style={styles.contentContainer}>
        {/* Fila superior: Categoría y Fuente Original */}
        <View style={styles.metaHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
          <Text style={styles.sourceText}>
            {article.source_name} ({article.country})
          </Text>
        </View>

        {/* Titular traducido */}
        <Text style={styles.title} numberOfLines={2}>
          {displayTitle}
        </Text>

        {/* Resumen corto */}
        {displaySummary ? (
          <Text style={styles.summary} numberOfLines={2}>
            {displaySummary}
          </Text>
        ) : null}

        {/* Fila inferior: Desduplicación y Fecha */}
        <View style={styles.footer}>
          {article.related_sources_count > 1 ? (
            <View style={styles.dedupBadge}>
              <Text style={styles.dedupText}>
                ⚡ {article.related_sources_count} fuentes unificadas (Sin repetir)
              </Text>
            </View>
          ) : (
            <Text style={styles.singleSourceText}>Fuente única</Text>
          )}

          <Text style={styles.dateText}>
            {article.pub_date ? article.pub_date : 'Reciente'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e24',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2d2d35',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: 190,
    backgroundColor: '#2a2a32',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#8e8e93',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 14,
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sourceText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    color: '#f4f4f5',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
    marginBottom: 6,
  },
  summary: {
    color: '#d4d4d8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2d2d35',
    pt: 8,
    marginTop: 4,
  },
  dedupBadge: {
    backgroundColor: '#166534',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dedupText: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '600',
  },
  singleSourceText: {
    color: '#71717a',
    fontSize: 11,
  },
  dateText: {
    color: '#71717a',
    fontSize: 11,
  },
});
