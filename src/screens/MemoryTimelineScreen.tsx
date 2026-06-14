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
import { Settings, SlidersHorizontal, Play, Music, MapPin, Heart, Home, PlusCircle, Camera, MessageCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export const MemoryTimelineScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Cinematic Gradient Background */}
      <View style={styles.cinematicGradient} />

      {/* Top AppBar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.goBack()}>
          <RNImage 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMRu_LBaxNNvLghfqqw_k9700Qz9JhQwpOcXLqpFwFWK_X8yE-Cw1_1hEsw9xdm-3rP_jCgnTkHgXYaT8h-WbqHEH3Fyzo9FWc03Ai6a8MkovfaWuM5wTFMCab09c4y1OlD05kp_BmIvk1s92VtJg_suPe22PRyOLMZZVz-odgQxW2oSkzV2EHat1uVI6D2y6QDFyTtI9aOYjyLDIh3OWweS-ux_1W_N4QjYJiMlumHbBehgSRXl81H6YOUmLTVpyylAAOIcpxwg' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Between</Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Settings')}>
          <Settings color={theme.colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      {/* Floating Filter + Add Memory */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => (navigation as any).navigate('CreateMemory')}
        >
          <Text style={styles.filterText}>+ ADD</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <SlidersHorizontal color={theme.colors.primary} size={16} />
          <Text style={styles.filterText}>FILTER</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Timeline Path */}
        <View style={styles.verticalThread} />

        <View style={styles.timelineList}>
          
          {/* Timeline Item 1 */}
          <View style={styles.timelineItem}>
            <View style={styles.glowingNode} />
            <Text style={styles.dateLabel}>OCTOBER 14, 2023</Text>
            
            <View style={styles.glassCard}>
              <View style={styles.imageWrapper1}>
                <RNImage 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdjLXg0oulCYulTMEMOD7pAFT6CWuv7GQLUksQwYJ5nQAXa6r5Cqe5i_tOjeqDNI5ze6RZuUR1Eq3bXJkb1bd-BSSYFiLUsfacfEyIVSnDQ3va8Xb2d2QkFBiU4t-la7Jcqm2qMs74c09mENI5eFnqnvuxxEr4PcvEP0l8234eetaiqr-GjkvwW-WUJVxCcx7_ioKjTtz-fXEgHht3_v--rxTgozXssoHShfOOjFM8sy6WErFLy2Y9T21GmHtWkBCcIZMpUQnODQ' }}
                  style={styles.mainImage}
                />
                <View style={styles.playerOverlay}>
                  <View style={styles.playerGlass}>
                    <View style={styles.playerControls}>
                      <Play color={theme.colors.primary} size={20} fill={theme.colors.primary} />
                      <View style={styles.progressBar}>
                        <View style={styles.progressFill} />
                      </View>
                    </View>
                    <Text style={styles.timeText}>0:42</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.footerRow}>
                  <Music color={theme.colors.secondary} size={14} />
                  <Text style={styles.footerText}>OUR SONG: CLAIR DE LUNE</Text>
                </View>
                <View style={styles.footerRow}>
                  <MapPin color={theme.colors.secondary} size={14} />
                  <Text style={styles.footerText}>HIGHLANDS</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Timeline Item 2 */}
          <View style={styles.timelineItem}>
            <View style={styles.glowingNode} />
            <Text style={styles.dateLabel}>AUGUST 22, 2023</Text>
            
            <View style={styles.glassCard}>
              <View style={styles.imageGrid}>
                <RNImage 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ7XZweGf81IAxgudexEZeEugTAjFYkuQ7XRM9uh1GxfAj2d4_BTzUfiwx2VuxWBtS6HK_olBrbTgtUbJO3SLAM4MPe-T6e7ATMRhSqAQ92hTVW7P_02RwYu36WmOvD1p_t0IOfJqmtiNU_sSXjeZckJXkkuLWJjCgBDRU7m0luY7RXmTPYPZRNQqJzesOjpq1Tzw311EzU9INwUMoaZ6vIlYsJYqCB4TRubBEXmpnuSxMjlLUIXYg_esJ7PHXs-Je33hO62ZGJg' }}
                  style={styles.gridImage}
                />
                <RNImage 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGs-JZf-6e7hjaZjBMJYf-lKSXNnDA_9kl7fsg17OhGNS3O-HeqEpIh4WAKRJCLvP9dL6kxJ-Orej-VQysoWOH7EEYSKVJj8yD9febTr2pkp3IMtiNpR3dHvSckK6qtP-YOfEjHmSOO6uceAx3eGtm4xiZD27eop0gQgphpoIdk_BWlymAkoWfgKUYrCjFr87gFsHF_t8WGminUaVZab7oGQQXzVC4Tgg-bJ7qGpVxK-DtN2442jGfFuqCDyAyEb7y88g-euCN9g' }}
                  style={styles.gridImage}
                />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Late summer memories at the gallery</Text>
                <View style={styles.footerRow}>
                  <MapPin color={theme.colors.secondary} size={14} />
                  <Text style={styles.footerText}>MODERN ART MUSEUM</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Timeline Item 3 */}
          <View style={styles.timelineItem}>
            <View style={[styles.glowingNode, { opacity: 0.4 }]} />
            <Text style={styles.dateLabel}>JUNE 05, 2023</Text>
            
            <View style={[styles.glassCard, styles.milestoneCard]}>
              <RNImage 
                source={{ uri: 'https://images.unsplash.com/photo-1516589174184-c68d8e21e4e8?q=80&w=1974&auto=format&fit=crop' }} 
                style={styles.milestoneBg}
              />
              <View style={styles.milestoneOverlay} />
              <View style={styles.heartCircle}>
                <Heart color={theme.colors.tertiary} size={28} fill={theme.colors.tertiary} />
              </View>
              <Text style={styles.milestoneTitle}>365 Days Together</Text>
              <Text style={styles.milestoneSubtitle}>Every moment has been a chapter in our favorite story.</Text>
              
              <View style={styles.divider} />
              
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>MONTHS</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>52</Text>
                  <Text style={styles.statLabel}>WEEKS</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>365</Text>
                  <Text style={styles.statLabel}>DAYS</Text>
                </View>
              </View>
            </View>
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
  cinematicGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(236, 185, 196, 0.04)', // Fake radial glow via opacity
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
    gap: 8,
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
    backgroundColor: '#ecb9c4', // tertiary-fixed-dim
    shadowColor: '#ecb9c4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
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
  },
  imageWrapper1: {
    aspectRatio: 4/5,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  playerOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  playerGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20, 19, 18, 0.6)',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginRight: 16,
  },
  progressFill: {
    width: '33%',
    height: '100%',
    backgroundColor: '#ecb9c4',
    borderRadius: 2,
  },
  timeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 4,
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
  imageGrid: {
    flexDirection: 'row',
    height: 250,
    gap: 8,
    marginBottom: 16,
  },
  gridImage: {
    flex: 1,
    height: '100%',
    borderRadius: 20,
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
  milestoneCard: {
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  milestoneBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  milestoneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heartCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(236, 185, 196, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  milestoneTitle: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  milestoneSubtitle: {
    fontSize: 14,
    color: 'rgba(197, 197, 216, 0.8)',
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(197, 197, 216, 0.6)',
    letterSpacing: 1,
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
