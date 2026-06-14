import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image as RNImage,
  Animated,
  Easing,
} from 'react-native';
import { theme } from '../theme/theme';
import { Sparkles, Hourglass, Mail, BookOpen, Gamepad2, MapPin, PenLine, Heart } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MOOD_LABELS } from '../types/mood';
import { formatMomentFooter, formatRelativeTime } from '../utils/time';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    userName,
    partnerName,
    sharedMomentUri,
    partnerMomentUri,
    partnerMomentUpdatedAt,
    partnerDailyStatus,
    userMood,
    dailyStatus,
    distanceLabel,
    distanceLive,
    locationSharingEnabled,
    partnerLocationUpdatedAt,
    sharedStoryPreview,
    memories,
  } = useAppContext();
  const { firebaseEnabled } = useAuth();

  const displayMomentUri = partnerMomentUri ?? (firebaseEnabled ? null : sharedMomentUri);
  const profileInitial = userName.trim().charAt(0).toUpperCase() || '?';
  
  // Animation Values
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Continuous Pulse for the Status Dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  const handleTouchStart = () => {
    Animated.spring(glowAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleTouchEnd = () => {
    Animated.spring(glowAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };
  return (
    <View style={styles.container}>
      {/* Cinematic Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Hello, {userName}</Text>
          <TouchableOpacity 
            style={styles.partnerStatus}
            onPressIn={handleTouchStart}
            onPressOut={handleTouchEnd}
            activeOpacity={1}
          >
            <View style={styles.dotWrapper}>
              <Animated.View 
                style={[
                  styles.statusPulse,
                  { transform: [{ scale: pulseAnim }], opacity: Animated.divide(1, pulseAnim).interpolate({
                    inputRange: [0.6, 1],
                    outputRange: [0, 0.4]
                  }) }
                ]} 
              />
              <View style={styles.statusDot} />
            </View>
            <Text style={styles.statusText}>
              {partnerDailyStatus || `Syncing with ${partnerName}`}
            </Text>
            
            {/* Live Connection Indicator */}
            <Animated.View style={[styles.liveGlow, { opacity: glowAnim }]} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Settings')}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitial}>{profileInitial}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Memory Focus - Glass Card */}
        <View style={styles.mainCard}>
          <View style={styles.cardGlow} />
          <View style={styles.glassContainer}>
            <Text style={styles.cardLabel}>
              {displayMomentUri ? `${partnerName.toUpperCase()}'S MOMENT` : "TODAY'S MOMENT"}
            </Text>
            <View style={styles.imagePlaceholder}>
              <RNImage 
                source={{ uri: displayMomentUri || 'https://images.unsplash.com/photo-1518131359103-6480ade8268e?q=80&w=2070&auto=format&fit=crop' }} 
                style={styles.mainImage}
                resizeMode="cover"
              />
              <View style={styles.innerGlow} />
              <View style={styles.imageOverlay}>
                <Text style={styles.placeholderText}>
                  {displayMomentUri
                    ? formatRelativeTime(partnerMomentUpdatedAt)
                    : 'Waiting for a moment'}
                </Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardTitle}>
                {displayMomentUri ? `From ${partnerName}` : 'Share a moment with the + button'}
              </Text>
              {displayMomentUri && partnerMomentUpdatedAt && (
                <Text style={styles.cardTime}>{formatMomentFooter(partnerMomentUpdatedAt)}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Widget previews — mirrors home-screen widgets */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Widgets</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.widgetScroll}>
          <TouchableOpacity style={styles.widgetCard} onPress={() => navigation.navigate('MoodTab')}>
            <Heart color={theme.colors.tertiary} size={20} />
            <Text style={styles.widgetLabel}>Your mood</Text>
            <Text style={styles.widgetValue}>{MOOD_LABELS[userMood] ?? userMood}</Text>
          </TouchableOpacity>
          <View style={styles.widgetCard}>
            <Sparkles color={theme.colors.secondary} size={20} />
            <Text style={styles.widgetLabel}>Your status</Text>
            <Text style={styles.widgetValueSmall} numberOfLines={2}>
              {dailyStatus}
            </Text>
          </View>
          {partnerDailyStatus ? (
            <View style={styles.widgetCard}>
              <Heart color={theme.colors.tertiary} size={20} />
              <Text style={styles.widgetLabel}>{partnerName}</Text>
              <Text style={styles.widgetValueSmall} numberOfLines={2}>
                {partnerDailyStatus}
              </Text>
            </View>
          ) : null}
          <View style={[styles.widgetCard, distanceLive && styles.widgetCardLive]}>
            <MapPin color={distanceLive ? '#4ADE80' : theme.colors.onSurfaceVariant} size={20} />
            <Text style={styles.widgetLabel}>Distance</Text>
            <Text style={styles.widgetValue}>{distanceLabel}</Text>
            <Text style={styles.widgetHint}>
              {distanceLive
                ? `Live · ${formatRelativeTime(partnerLocationUpdatedAt)}`
                : locationSharingEnabled
                  ? `Waiting for ${partnerName}'s location`
                  : 'Enable location to track'}
            </Text>
          </View>
          {sharedStoryPreview && (
            <TouchableOpacity
              style={styles.widgetCard}
              onPress={() => navigation.navigate('SharedStory')}
            >
              <PenLine color={theme.colors.primary} size={20} />
              <Text style={styles.widgetLabel}>
                {sharedStoryPreview.isLive ? 'Drawing live' : 'Story sent'}
              </Text>
              <Text style={styles.widgetValueSmall}>
                {sharedStoryPreview.strokeCount} strokes · {sharedStoryPreview.stickerCount} stickers
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('MoodTab')}>
            <View style={styles.actionIconWrapper}>
              <Sparkles color={theme.colors.primary} size={24} />
            </View>
            <Text style={styles.actionLabel}>Mood</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('PlayHub')}>
            <View style={styles.actionIconWrapper}>
              <Gamepad2 color={theme.colors.primary} size={24} />
            </View>
            <Text style={styles.actionLabel}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('SharedStory')}>
            <View style={styles.actionIconWrapper}>
              <PenLine color={theme.colors.primary} size={24} />
            </View>
            <Text style={styles.actionLabel}>Story</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('TimelineTab')}>
            <View style={styles.actionIconWrapper}>
              <BookOpen color={theme.colors.primary} size={24} />
            </View>
            <Text style={styles.actionLabel}>Memories</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryChip} onPress={() => navigation.navigate('Anniversary')}>
            <Hourglass color={theme.colors.primary} size={16} />
            <Text style={styles.secondaryChipText}>Anniversaries</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryChip} onPress={() => navigation.navigate('LettersTab')}>
            <Mail color={theme.colors.primary} size={16} />
            <Text style={styles.secondaryChipText}>Letters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryChip} onPress={() => navigation.navigate('StoryGenerator')}>
            <Sparkles color={theme.colors.primary} size={16} />
            <Text style={styles.secondaryChipText}>AI Story</Text>
          </TouchableOpacity>
        </View>

        {/* The Sanctuary Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shared Sanctuary</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TimelineTab')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.vaultPreview} onPress={() => navigation.navigate('PrivateVault')}>
          <View style={styles.vaultCard}>
            <Text style={styles.vaultTitle}>Private Vault</Text>
            <Text style={styles.vaultCount}>
              {memories.length === 0
                ? 'No memories yet'
                : `${memories.length} Shared ${memories.length === 1 ? 'Memory' : 'Memories'}`}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {},
  greeting: {
    fontSize: 24,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '600',
    marginBottom: 4,
  },
  partnerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  dotWrapper: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  statusPulse: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ADE80',
  },
  liveGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: 20,
    zIndex: -1,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: theme.typography.fontFamily,
  },
  profileButton: {},
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.containerPadding,
    paddingBottom: 130, // Space for the floating tab bar
  },
  mainCard: {
    marginBottom: 32,
    borderRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: 'rgba(197, 197, 216, 0.05)',
    borderRadius: 50,
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 32,
    padding: 24,
  },
  cardLabel: {
    color: 'rgba(197, 197, 216, 0.4)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 16,
  },
  imagePlaceholder: {
    height: 240,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  innerGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  placeholderText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardFooter: {
    marginTop: 20,
  },
  cardTitle: {
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardTime: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    opacity: 0.7,
  },
  widgetScroll: {
    marginBottom: 28,
    marginHorizontal: -theme.spacing.containerPadding,
    paddingHorizontal: theme.spacing.containerPadding,
  },
  widgetCard: {
    width: 140,
    minHeight: 110,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    padding: 16,
    marginRight: 12,
    justifyContent: 'space-between',
  },
  widgetCardLive: {
    borderColor: 'rgba(74, 222, 128, 0.35)',
    backgroundColor: 'rgba(74, 222, 128, 0.06)',
  },
  widgetLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.onSurfaceVariant,
    marginTop: 8,
    marginBottom: 4,
  },
  widgetValue: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  widgetValueSmall: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '500',
    lineHeight: 18,
  },
  widgetHint: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  secondaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.roundness.lg,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  secondaryChipText: {
    fontSize: 12,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  actionItem: {
    alignItems: 'center',
    width: (width - 60) / 4,
  },
  actionIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 24,
    color: theme.colors.primary,
  },
  actionLabel: {
    fontSize: 12,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  vaultPreview: {
    width: '100%',
    height: 120,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    padding: 20,
    justifyContent: 'center',
  },
  vaultCard: {},
  vaultTitle: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  vaultCount: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  navBar: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  navGlass: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 19, 18, 0.8)',
    borderRadius: 35,
    height: 70,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 24,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
});
