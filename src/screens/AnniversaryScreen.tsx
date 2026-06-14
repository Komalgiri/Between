import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image as RNImage,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme/theme';
import { ArrowLeft, CalendarHeart, Gift, Clock, Wine, Star } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { addReminder, subscribeToReminders, ReminderItem } from '../services/reminderService';
import {
  formatAnniversaryLabel,
  getDaysUntilNextAnniversary,
  getDurationStats,
  getYearsTogether,
} from '../utils/anniversary';

const { height } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList>;

const REMINDER_ICONS = {
  date: Wine,
  gift: Gift,
  milestone: Star,
} as const;

export const AnniversaryScreen = () => {
  const navigation = useNavigation<Nav>();
  const { anniversary, partnerName, relationshipId } = useAppContext();
  const { firebaseEnabled, user } = useAuth();

  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDueLabel, setNewDueLabel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!firebaseEnabled || !relationshipId) return;
    return subscribeToReminders(relationshipId, setReminders);
  }, [firebaseEnabled, relationshipId]);

  const daysUntil = useMemo(() => getDaysUntilNextAnniversary(anniversary), [anniversary]);
  const yearsTogether = useMemo(() => getYearsTogether(anniversary), [anniversary]);
  const durationStats = useMemo(() => getDurationStats(anniversary), [anniversary]);
  const hasAnniversary = Boolean(anniversary.trim() && daysUntil !== null);

  const countdownText = hasAnniversary
    ? daysUntil === 0
      ? 'TODAY IS OUR ANNIVERSARY'
      : `${daysUntil} DAY${daysUntil === 1 ? '' : 'S'} UNTIL OUR ANNIVERSARY`
    : 'SET YOUR DATE IN ONBOARDING';

  const heroTitle = hasAnniversary
    ? formatAnniversaryLabel(yearsTogether ?? 0)
    : 'Your story begins here';

  const handleAddReminder = async () => {
    if (!newTitle.trim() || !newDueLabel.trim()) {
      Alert.alert('Add details', 'Enter a title and when it happens.');
      return;
    }
    if (!firebaseEnabled || !user || !relationshipId) {
      Alert.alert('Offline', 'Sign in with Firebase to share reminders.');
      return;
    }

    setSaving(true);
    try {
      await addReminder(relationshipId, user.uid, {
        title: newTitle.trim(),
        dueLabel: newDueLabel.trim(),
        type: 'milestone',
      });
      setNewTitle('');
      setNewDueLabel('');
      setShowAddForm(false);
    } catch {
      Alert.alert('Could not save', 'Check Firestore rules.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <View style={styles.heroSection}>
          <RNImage
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGs-JZf-6e7hjaZjBMJYf-lKSXNnDA_9kl7fsg17OhGNS3O-HeqEpIh4WAKRJCLvP9dL6kxJ-Orej-VQysoWOH7EEYSKVJj8yD9febTr2pkp3IMtiNpR3dHvSckK6qtP-YOfEjHmSOO6uceAx3eGtm4xiZD27eop0gQgphpoIdk_BWlymAkoWfgKUYrCjFr87gFsHF_t8WGminUaVZab7oGQQXzVC4Tgg-bJ7qGpVxK-DtN2442jGfFuqCDyAyEb7y88g-euCN9g',
            }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay} />

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeft color={theme.colors.primary} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.countdownPill}>
              <CalendarHeart color={theme.colors.background} size={16} />
              <Text style={styles.countdownText}>{countdownText}</Text>
            </View>
            <Text style={styles.heroTitle}>{heroTitle}</Text>
            <Text style={styles.heroSubtitle}>
              {hasAnniversary
                ? `Every moment with ${partnerName} has led to this beautiful chapter.`
                : 'Complete onboarding with your anniversary date to unlock the countdown.'}
            </Text>
          </View>
        </View>

        <View style={styles.contentSection}>
          {durationStats && (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{durationStats.months}</Text>
                <Text style={styles.statLabel}>MONTHS</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{durationStats.weeks}</Text>
                <Text style={styles.statLabel}>WEEKS</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{durationStats.days}</Text>
                <Text style={styles.statLabel}>DAYS</Text>
              </View>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity onPress={() => setShowAddForm((v) => !v)}>
              <Text style={styles.viewAllBtn}>{showAddForm ? 'CANCEL' : 'ADD NEW'}</Text>
            </TouchableOpacity>
          </View>

          {showAddForm && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.addInput}
                placeholder="Reminder title"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={newTitle}
                onChangeText={setNewTitle}
              />
              <TextInput
                style={styles.addInput}
                placeholder="When (e.g. In 3 days, Tomorrow 8 PM)"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={newDueLabel}
                onChangeText={setNewDueLabel}
              />
              <TouchableOpacity
                style={[styles.addBtn, saving && styles.addBtnDisabled]}
                onPress={handleAddReminder}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={theme.colors.background} />
                ) : (
                  <Text style={styles.addBtnText}>SAVE REMINDER</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.remindersList}>
            {reminders.length === 0 ? (
              <Text style={styles.emptyReminders}>No reminders yet — add one for {partnerName}.</Text>
            ) : (
              reminders.map((reminder) => {
                const Icon = REMINDER_ICONS[reminder.type] ?? Star;
                return (
                  <View key={reminder.id} style={styles.reminderCard}>
                    <View style={styles.reminderIconBox}>
                      <Icon color={theme.colors.primary} size={24} />
                    </View>
                    <View style={styles.reminderInfo}>
                      <Text style={styles.reminderTitle}>{reminder.title}</Text>
                      <View style={styles.reminderTimeRow}>
                        <Clock color={theme.colors.secondary} size={12} />
                        <Text style={styles.reminderDate}>{reminder.dueLabel}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <TouchableOpacity
            style={styles.firstsPromo}
            onPress={() => navigation.navigate('MainApp', { screen: 'TimelineTab' })}
          >
            <View style={styles.firstsPromoGlow} />
            <Text style={styles.firstsLabel}>OUR ARCHIVE</Text>
            <Text style={styles.firstsTitle}>Look back at our memories</Text>
            <ArrowLeft
              style={{ transform: [{ rotate: '180deg' }], marginTop: 16 }}
              color={theme.colors.primary}
              size={24}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    width: '100%',
    height: height * 0.55,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerRow: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e4e4cc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  countdownText: {
    color: '#303221',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 40,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
  },
  contentSection: {
    padding: 24,
    paddingTop: 32,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingVertical: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    letterSpacing: 1,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  viewAllBtn: {
    fontSize: 10,
    color: theme.colors.secondary,
    fontWeight: '700',
    letterSpacing: 2,
  },
  addForm: {
    gap: 10,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  addInput: {
    backgroundColor: theme.colors.glass,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    padding: 14,
    color: theme.colors.primary,
    fontSize: 15,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.7,
  },
  addBtnText: {
    color: theme.colors.background,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
  remindersList: {
    gap: 16,
    marginBottom: 40,
  },
  emptyReminders: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 22,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  reminderIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  reminderTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reminderDate: {
    fontSize: 12,
    color: theme.colors.secondary,
  },
  firstsPromo: {
    backgroundColor: 'rgba(236, 185, 196, 0.05)',
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(236, 185, 196, 0.1)',
    overflow: 'hidden',
  },
  firstsPromoGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    backgroundColor: 'rgba(236, 185, 196, 0.2)',
    borderRadius: 75,
  },
  firstsLabel: {
    color: '#ecb9c4',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  firstsTitle: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: '600',
  },
});
