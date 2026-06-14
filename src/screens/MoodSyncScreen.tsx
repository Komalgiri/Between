import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image as RNImage,
  ScrollView,
  TextInput,
} from 'react-native';
import { theme } from '../theme/theme';
import { Settings, Home, Heart, PlusCircle, Image as ImageIcon, MessageCircle, Cloud, BookOpen, Sparkles, Moon, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext, MoodId } from '../context/AppContext';

const { width } = Dimensions.get('window');

const MOOD_OPTIONS: { id: MoodId; label: string; Icon: typeof Cloud }[] = [
  { id: 'serene', label: 'Serene', Icon: Cloud },
  { id: 'connected', label: 'Connected', Icon: Heart },
  { id: 'pensive', label: 'Pensive', Icon: BookOpen },
];

const PARTNER_MOOD_LABELS: Record<MoodId, string> = {
  serene: 'Serene',
  connected: 'Connected',
  pensive: 'Pensive',
  restful: 'Restful',
};

export const MoodSyncScreen = () => {
  const navigation = useNavigation();
  const { userMood, setUserMood, partnerMood, dailyStatus, setDailyStatus, partnerName } = useAppContext();

  return (
    <View style={styles.container}>
      {/* Background Ambience */}
      <View style={[styles.moodBlob, styles.blobTopRight]} />
      <View style={[styles.moodBlob, styles.blobBottomLeft]} />

      {/* TopAppBar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.goBack()}>
          <RNImage 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmnkAJL1SwhDnvZhYP-mXaVbw36tF2OshrT1oAcJm3fhq5NLcwv16sUqjNEWmE5Uh9tk15FTfqSD0gJUP4OcOk5iust_9fGyvNg0su1bftX4QFTpg4_KERgvtZ9qcPYpS-4AfdSTrdI4tTwjvEsL1GsEptTwCCUIAcuam8btm-CoUeFRO8NV_rClL1Ltt-ODW5ewi-M_08HT6-ZKGtCCoMHMT-ulbLyjJroMO8NldHIDHKsRL8aRhQdon_yij1oRty_DvuiwaP1A' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Between</Text>
        <TouchableOpacity>
          <Settings color={theme.colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Mood Check-in Area */}
        <View style={styles.checkInSection}>
          <Text style={styles.dailyLabel}>DAILY CONNECTION</Text>
          <Text style={styles.question}>How are you feeling?</Text>

          <View style={styles.moodSelectorRow}>
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = userMood === mood.id;
              return (
                <TouchableOpacity 
                  key={mood.id} 
                  style={[styles.moodOption, isSelected ? styles.moodOptionSelected : styles.moodOptionUnselected]}
                  onPress={() => setUserMood(mood.id)}
                >
                  <View style={[
                    styles.moodIconCircle, 
                    { backgroundColor: isSelected ? 'rgba(255, 217, 224, 0.2)' : 'rgba(255, 255, 255, 0.05)' },
                    isSelected && { borderColor: 'rgba(255, 255, 255, 0.2)', borderWidth: 1 }
                  ]}>
                    <mood.Icon 
                      color={isSelected ? theme.colors.primary : theme.colors.primary} 
                      size={isSelected ? 36 : 28} 
                      fill={isSelected && mood.id === 'connected' ? theme.colors.primary : 'transparent'}
                    />
                  </View>
                  <Text style={[styles.moodLabel, isSelected ? styles.moodLabelSelected : null]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.statusLabel}>DAILY STATUS</Text>
          <TextInput
            style={styles.statusInput}
            value={dailyStatus}
            onChangeText={setDailyStatus}
            placeholder={`What is ${partnerName} going to see on your widget?`}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            maxLength={80}
          />
        </View>

        {/* Comparison View */}
        <View style={styles.comparisonGrid}>
          {/* YOU */}
          <View style={styles.glassCardComparison}>
            <View style={[styles.cardGlow, { backgroundColor: '#ffd9e0', top: -30, right: -30 }]} />
            <Text style={styles.comparisonLabel}>YOU</Text>
            <View style={styles.comparisonIconBox}>
              <Heart color={theme.colors.primary} size={32} fill={theme.colors.primary} />
            </View>
            <Text style={styles.comparisonMood}>
              {MOOD_OPTIONS.find((m) => m.id === userMood)?.label ?? 'Connected'}
            </Text>
            <Text style={styles.comparisonTime}>Live on widget</Text>
          </View>

          {/* PARTNER */}
          <View style={styles.glassCardComparison}>
            <View style={[styles.cardGlow, { backgroundColor: '#c5c5d8', top: -30, left: -30 }]} />
            <Text style={styles.comparisonLabel}>{partnerName.toUpperCase()}</Text>
            <View style={styles.comparisonIconBox}>
              <Moon color="#c5c5d8" size={32} fill="#c5c5d8" />
            </View>
            <Text style={styles.comparisonMood}>{PARTNER_MOOD_LABELS[partnerMood]}</Text>
            <Text style={styles.comparisonTime}>Updated 1h ago</Text>
          </View>
        </View>

        {/* Intimacy Prompt */}
        <TouchableOpacity style={styles.intimacyPrompt}>
          <View style={styles.promptIconBox}>
            <Sparkles color={theme.colors.primary} size={24} />
          </View>
          <View style={styles.promptTextContainer}>
            <Text style={styles.promptTitle}>Shared Moment</Text>
            <Text style={styles.promptSubtitle}>Your moods are harmonizing. Send a nudge to let them know you're thinking of them.</Text>
          </View>
          <ChevronRight color={theme.colors.secondary} size={24} />
        </TouchableOpacity>

        {/* Mood History Peek */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Mood Arc</Text>
            <TouchableOpacity>
              <Text style={styles.historyViewAll}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.historyGraphCard}>
            {/* Mock Graph Bars */}
            <View style={[styles.graphBar, { height: '40%', backgroundColor: 'rgba(255, 217, 224, 0.4)' }]} />
            <View style={[styles.graphBar, { height: '60%', backgroundColor: 'rgba(255, 217, 224, 0.6)' }]} />
            <View style={[styles.graphBar, { height: '30%', backgroundColor: 'rgba(197, 197, 216, 0.5)' }]} />
            <View style={[styles.graphBar, { height: '80%', backgroundColor: 'rgba(255, 217, 224, 0.7)', borderTopWidth: 2, borderTopColor: 'rgba(255,255,255,0.4)' }]} />
            <View style={[styles.graphBar, { height: '45%', backgroundColor: 'rgba(255, 217, 224, 0.4)' }]} />
            <View style={[styles.graphBar, { height: '55%', backgroundColor: 'rgba(197, 197, 216, 0.6)' }]} />
            <View style={[styles.graphBar, { height: '95%', backgroundColor: 'rgba(255, 217, 224, 0.8)' }]} />
          </View>
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
  moodBlob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.15,
  },
  blobTopRight: {
    top: -50,
    right: -50,
    backgroundColor: '#c5c5d8',
  },
  blobBottomLeft: {
    bottom: '10%',
    left: -50,
    backgroundColor: '#ffd9e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
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
  avatar: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    fontSize: 28,
    color: theme.colors.primary,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily,
    letterSpacing: -1,
  },
  scrollContent: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  checkInSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  dailyLabel: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  question: {
    fontSize: 36,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 40,
  },
  moodSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  moodOption: {
    alignItems: 'center',
  },
  moodOptionSelected: {
    transform: [{ scale: 1.1 }],
  },
  moodOptionUnselected: {
    opacity: 0.6,
  },
  moodIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  moodLabel: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  moodLabelSelected: {
    color: theme.colors.primary,
  },
  statusLabel: {
    color: theme.colors.secondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 28,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  statusInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    color: theme.colors.primary,
    fontSize: 15,
  },
  comparisonGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  glassCardComparison: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.15,
  },
  comparisonLabel: {
    color: theme.colors.secondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 20,
  },
  comparisonIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  comparisonMood: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  comparisonTime: {
    color: 'rgba(197, 197, 216, 0.6)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  intimacyPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    gap: 16,
    marginBottom: 32,
  },
  promptIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptTextContainer: {
    flex: 1,
  },
  promptTitle: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  promptSubtitle: {
    color: theme.colors.secondary,
    fontSize: 12,
    lineHeight: 18,
  },
  historySection: {
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  historyTitle: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '500',
  },
  historyViewAll: {
    color: theme.colors.secondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  historyGraphCard: {
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  graphBar: {
    flex: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '90%',
    backgroundColor: 'rgba(28, 28, 26, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 40,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navAddBtn: {
    transform: [{ scale: 1.1 }],
  },
});
