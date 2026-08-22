import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  SafeAreaView,
} from 'react-native';
import { NewsArticle } from '../services/api';

interface NewsDetailModalProps {
  visible: boolean;
  article: NewsArticle | null;
  onClose: () => void;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({
  visible,
  article,
  onClose,
}) => {
  if (!article) return null;

  const displayTitle = article.title_es || article.title;
  const displaySummary = article.summary_es || article.summary;

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('No se pudo abrir el enlace:', err)
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕ Cerrar</Text>
          </TouchableOpacity>
          <Text style={styles.headerCategory}>{article.category}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {article.image_url ? (
            <Image
              source={{ uri: article.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : null}

          <View style={styles.body}>
            <View style={styles.sourceTagContainer}>
              <Text style={styles.sourceTag}>
                {article.source_name} ({article.country})
              </Text>
              <Text style={styles.pubDate}>{article.pub_date || 'Reciente'}</Text>
            </View>

            <Text style={styles.title}>{displayTitle}</Text>
            <Text style={styles.summary}>{displaySummary}</Text>

            {/* Sección de desduplicación / Fuentes secundarias */}
            {article.other_sources && article.other_sources.length > 0 ? (
              <View style={styles.sourcesSection}>
                <Text style={styles.sourcesSectionTitle}>
                  🌐 Cobertura Unificada ({article.related_sources_count} Medios Mundiales)
                </Text>

                {article.other_sources.map((src, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.sourceRow}
                    onPress={() => handleOpenLink(src.link)}
                  >
                    <Text style={styles.sourceRowName}>
                      • {src.name} ({src.country})
                    </Text>
                    <Text style={styles.sourceRowAction}>Ver →</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* Botón hacia la fuente oficial */}
            <TouchableOpacity
              style={styles.openButton}
              onPress={() => handleOpenLink(article.link)}
            >
              <Text style={styles.openButtonText}>
                Leer artículo completo en {article.source_name} ↗
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '700',
  },
  headerCategory: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 250,
  },
  body: {
    padding: 18,
  },
  sourceTagContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sourceTag: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '700',
  },
  pubDate: {
    color: '#71717a',
    fontSize: 12,
  },
  title: {
    color: '#f4f4f5',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 14,
  },
  summary: {
    color: '#d4d4d8',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  sourcesSection: {
    backgroundColor: '#1e1e24',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2d2d35',
  },
  sourcesSectionTitle: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d35',
  },
  sourceRowName: {
    color: '#e4e4e7',
    fontSize: 14,
  },
  sourceRowAction: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  openButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  openButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
