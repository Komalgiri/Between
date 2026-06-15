import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image as RNImage,
  Alert,
} from 'react-native';
import { theme } from '../theme/theme';
import { Settings, Camera, BookOpen } from 'lucide-react-native';
import { DistanceConnection } from '../components/DistanceConnection';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatMomentFooter, formatRelativeTime } from '../utils/time';
import { formatMemoryDate } from '../utils/memoryFormat';

const { width } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const MemoryTimelineScreen = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const {
    sharedMoments,
    partnerName,
    userName,
    distanceKm,
    distanceLabel,
    distanceLive,
    refreshLocation,
  } = useAppContext();

  const handleFixDistance = async () => {
    const ok = await refreshLocation();
    Alert.alert(
      ok ? 'Distance updated' : 'Could not update',
      ok
        ? 'Your location was refreshed. Distance shows once your partner shares theirs too.'
        : 'Allow location access for BETWEEN in your phone settings, then try again.'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.cinematicGradient} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.goBack()}>
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Moments</Text>
        <View style={styles.headerActions}>
          <DistanceConnection
            compact
            userName={userName}
            partnerName={partnerName}
            distanceKm={distanceKm}
            distanceLabel={distanceLabel}
            distanceLive={distanceLive}
            onPress={handleFixDistance}
          />
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Settings color={theme.colors.primary} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.verticalThread} />

        {sharedMoments.length === 0 ? (
          <View style={styles.emptyState}>
            <Camera color={theme.colors.onSurfaceVariant} size={40} />
            <Text style={styles.emptyTitle}>No shared moments yet</Text>
            <Text style={styles.emptySubtitle}>
              Use the + button on Home to share a photo with {partnerName}. Private vault memories stay hidden.
            </Text>
          </View>
        ) : (
          <View style={styles.timelineList}>
            {sharedMoments.map((moment) => {
              const mine = user?.uid === moment.userId;
              return (
                <View key={moment.id} style={styles.timelineItem}>
                  <View style={styles.glowingNode} />
                  <Text style={styles.dateLabel}>
                    {(moment.createdAt ? formatMemoryDate(moment.createdAt) : 'Today').toUpperCase()}
                  </Text>

                  <View style={styles.glassCard}>
                    <RNImage source={{ uri: moment.imageUrl }} style={styles.mainImage} resizeMode="cover" />
                    <View style={styles.timeBadge}>
                      <Camera color={theme.colors.primary} size={12} />
                      <Text style={styles.timeBadgeText}>{formatRelativeTime(moment.createdAt)}</Text>
                    </View>

                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>
                        {moment.caption?.trim() || (mine ? 'You shared a moment' : `${moment.displayName} shared`)}
                      </Text>
                      <Text style={styles.cardNote}>{formatMomentFooter(moment.createdAt)}</Text>
                      {moment.displayName ? (
                        <Text style={styles.authorText}>by {mine ? 'You' : moment.displayName}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 150,
  },
  verticalThread: {
    position: 'absolute',
    left: width / 2,
    top: 24,
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
  timeBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  timeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  cardInfo: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 6,
  },
  cardTitle: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  cardNote: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
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
