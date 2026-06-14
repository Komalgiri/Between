import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image as RNImage,
  ScrollView,
} from 'react-native';
import { theme } from '../theme/theme';
import { ArrowLeft, CalendarHeart, Gift, Clock, Wine, Star } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const REMINDERS = [
  { id: '1', title: 'Dinner at Lumiere', date: 'Tonight, 8:00 PM', type: 'date', Icon: Wine },
  { id: '2', title: 'Pick up flowers', date: 'Tomorrow, 5:00 PM', type: 'gift', Icon: Gift },
  { id: '3', title: 'First Kiss Anniversary', date: 'In 3 days', type: 'milestone', Icon: Star },
];

export const AnniversaryScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <RNImage 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGs-JZf-6e7hjaZjBMJYf-lKSXNnDA_9kl7fsg17OhGNS3O-HeqEpIh4WAKRJCLvP9dL6kxJ-Orej-VQysoWOH7EEYSKVJj8yD9febTr2pkp3IMtiNpR3dHvSckK6qtP-YOfEjHmSOO6uceAx3eGtm4xiZD27eop0gQgphpoIdk_BWlymAkoWfgKUYrCjFr87gFsHF_t8WGminUaVZab7oGQQXzVC4Tgg-bJ7qGpVxK-DtN2442jGfFuqCDyAyEb7y88g-euCN9g' }}
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
              <Text style={styles.countdownText}>14 DAYS UNTIL OUR ANNIVERSARY</Text>
            </View>
            <Text style={styles.heroTitle}>2 Years Together</Text>
            <Text style={styles.heroSubtitle}>Every moment has led to this beautiful chapter.</Text>
          </View>
        </View>

        {/* Reminders List */}
        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllBtn}>ADD NEW</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.remindersList}>
            {REMINDERS.map((reminder) => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderIconBox}>
                  <reminder.Icon color={theme.colors.primary} size={24} />
                </View>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <View style={styles.reminderTimeRow}>
                    <Clock color={theme.colors.secondary} size={12} />
                    <Text style={styles.reminderDate}>{reminder.date}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Firsts Collection Promo */}
          <TouchableOpacity style={styles.firstsPromo}>
            <View style={styles.firstsPromoGlow} />
            <Text style={styles.firstsLabel}>OUR ARCHIVE</Text>
            <Text style={styles.firstsTitle}>Look back at our "Firsts"</Text>
            <ArrowLeft style={{ transform: [{ rotate: '180deg' }], marginTop: 16 }} color={theme.colors.primary} size={24} />
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
  remindersList: {
    gap: 16,
    marginBottom: 40,
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
    shadowColor: '#ecb9c4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 10,
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
