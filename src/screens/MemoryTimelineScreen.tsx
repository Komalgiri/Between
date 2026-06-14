import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image as RNImage,
} from 'react-native';
import { theme } from '../theme/theme';
import { Settings, SlidersHorizontal, MapPin, BookOpen } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const MemoryTimelineScreen = () => {
  const navigation = useNavigation<Nav>();
  const { memories, partnerName, userName } = useAppContext();

  return (
    <View style={styles.container}>
      <View style={styles.cinematicGradient} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.goBack()}>
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Between</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Settings color={theme.colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('CreateMemory')}
        >
          <Text style={styles.filterText}>+ ADD</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.verticalThread} />

        {memories.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen color={theme.colors.onSurfaceVariant} size={40} />
            <Text style={styles.emptyTitle}>No memories yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap + ADD to share a moment with {partnerName}.
            </Text>
          </View>
        ) : (
          <View style={styles.timelineList}>
            {memories.map((memory) => (
              <View key={memory.id} style={styles.timelineItem}>
                <View style={styles.glowingNode} />
                <Text style={styles.dateLabel}>{memory.date.toUpperCase()}</Text>

                <View style={styles.glassCard}>
                  {memory.uri ? (
                    <RNImage source={{ uri: memory.uri }} style={styles.mainImage} />
                  ) : (
                    <View style={styles.noteCard}>
                      <BookOpen color={theme.colors.secondary} size={28} />
                      <Text style={styles.noteTitle}>{memory.title}</Text>
                    </View>
                  )}

                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{memory.title}</Text>
                    {memory.note ? (
                      <Text style={styles.cardNote} numberOfLines={3}>
                        {memory.note}
                      </Text>
                    ) : null}
                    <View style={styles.footerRow}>
                      <MapPin color={theme.colors.secondary} size={14} />
                      <Text style={styles.footerText}>
                        {(memory.location || 'Our sanctuary').toUpperCase()}
                      </Text>
                    </View>
                    {memory.authorName ? (
                      <Text style={styles.authorText}>by {memory.authorName}</Text>
                    ) : null}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cinematicGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(236, 185, 196, 0.04)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(20, 19, 18, 0.5)',
    zIndex: 50,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.glass,
  },
  avatarText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    color: theme.colors.primary,
    fontWeight: '600',
    letterSpacing: -1,
  },
  filterContainer: {
    position: 'absolute',
    top: 110,
    right: 20,
    zIndex: 40,
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 150,
  },
  verticalThread: {
    position: 'absolute',
    left: width / 2,
    top: 60,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(236, 185, 196, 0.2)',
    zIndex: 0,
  },
  timelineList: {
    paddingHorizontal: 20,
  },
  timelineItem: {
    alignItems: 'center',
    marginBottom: 48,
    zIndex: 10,
  },
  glowingNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ecb9c4',
    shadowColor: '#ecb9c4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 10,
    color: 'rgba(197, 197, 216, 0.6)',
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 24,
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  noteCard: {
    aspectRatio: 4 / 5,
    borderRadius: 20,
    backgroundColor: theme.colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
    padding: 24,
  },
  noteTitle: {
    color: theme.colors.primary,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  cardInfo: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  cardNote: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 10,
    color: 'rgba(197, 197, 216, 0.8)',
    letterSpacing: 1,
    fontWeight: '700',
  },
  authorText: {
    fontSize: 11,
    color: theme.colors.tertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
});
