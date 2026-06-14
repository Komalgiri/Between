import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image as RNImage,
  ScrollView,
  Platform,
} from 'react-native';
import { theme } from '../theme/theme';
import { ArrowLeft, Lock, Unlock, Image as ImageIcon, FileText, Heart, Plus, ShieldCheck, Search, Filter, BookOpen } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

export const PrivateVaultScreen = () => {
  const navigation = useNavigation();
  const { vaultItems } = useAppContext();
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Fake Biometric / PIN entry simulation
  if (!isUnlocked) {
    return (
      <View style={styles.lockContainer}>
        <View style={styles.lockGlow} />
        
        <TouchableOpacity style={styles.backButtonAbsolute} onPress={() => navigation.goBack()}>
          <ArrowLeft color={theme.colors.onSurfaceVariant} size={28} />
        </TouchableOpacity>

        <View style={styles.lockContent}>
          <View style={styles.lockIconCircle}>
            <Lock color={theme.colors.primary} size={40} />
          </View>
          <Text style={styles.lockTitle}>Private Vault</Text>
          <Text style={styles.lockSubtitle}>Protected by biometric encryption.</Text>

          {/* Fake Pin dots */}
          <View style={styles.pinDots}>
            <View style={[styles.dot, styles.dotFilled]} />
            <View style={[styles.dot, styles.dotFilled]} />
            <View style={[styles.dot, styles.dotFilled]} />
            <View style={styles.dot} />
          </View>

          {/* Unlock Button */}
          <TouchableOpacity 
            style={styles.unlockButton}
            onPress={() => setIsUnlocked(true)}
          >
            <ShieldCheck color="#c8c8b0" size={20} />
            <Text style={styles.unlockButtonText}>Tap to Unlock</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Ambience */}
      <View style={[styles.ambientBlob, { top: -100, right: -100, backgroundColor: '#c5c5d8' }]} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.primary} size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Unlock color={theme.colors.secondary} size={18} />
          <Text style={styles.headerTitle}>Vault</Text>
        </View>
        <TouchableOpacity>
          <Filter color={theme.colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search color="rgba(197, 197, 216, 0.4)" size={20} />
          <Text style={styles.searchPlaceholder}>Search hidden memories...</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.gridContainer}>
          {vaultItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.gridItem}>
              {item.type === 'image' ? (
                <RNImage source={{ uri: item.uri }} style={styles.itemImage} />
              ) : item.type === 'story' ? (
                <View style={[styles.noteItem, { backgroundColor: '#F7F3EB' }]}>
                  <BookOpen color="#2C2B29" size={32} />
                  <Text style={[styles.noteTitle, { color: '#2C2B29', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{item.title}</Text>
                </View>
              ) : (
                <View style={styles.noteItem}>
                  <FileText color={theme.colors.secondary} size={32} />
                  <Text style={styles.noteTitle}>{item.title}</Text>
                </View>
              )}
              
              {/* Item Overlay */}
              <View style={styles.itemOverlay}>
                <Text style={styles.itemDate}>{item.date}</Text>
                {item.type === 'image' && <Text style={styles.itemTitle}>{item.title}</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Plus color={theme.colors.background} size={32} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  lockContainer: {
    flex: 1,
    backgroundColor: '#0e0e0d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockGlow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    backgroundColor: 'rgba(236, 185, 196, 0.03)',
    top: -width / 2,
  },
  backButtonAbsolute: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  lockContent: {
    alignItems: 'center',
  },
  lockIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  lockTitle: {
    fontSize: 32,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  lockSubtitle: {
    fontSize: 14,
    color: 'rgba(197, 197, 216, 0.6)',
    marginBottom: 48,
  },
  pinDots: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 64,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotFilled: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(200, 200, 176, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 176, 0.3)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  unlockButtonText: {
    color: '#c8c8b0',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  ambientBlob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  searchPlaceholder: {
    color: 'rgba(197, 197, 216, 0.4)',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 150,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 48) / 2, // 2 columns with padding and gap
    aspectRatio: 3/4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  noteItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  noteTitle: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  itemOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  itemDate: {
    color: 'rgba(197, 197, 216, 0.8)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  itemTitle: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#c8c8b0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#c8c8b0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
