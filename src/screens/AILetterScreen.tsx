import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image as RNImage,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '../theme/theme';
import { ArrowLeft, Sparkles, RefreshCw, Edit2, Send, Home, Heart, PlusCircle, Camera, MessageCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const MOOD_CHIPS = ['Apology', 'Romantic', 'Missing You', 'Appreciation'];

export const AILetterScreen = () => {
  const navigation = useNavigation();
  const [selectedChip, setSelectedChip] = useState('Apology');
  const [prompt, setPrompt] = useState('');
  
  // Blinking cursor simulation
  const [cursorVisible, setCursorVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color={theme.colors.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Letters</Text>
        </View>
        <TouchableOpacity style={styles.avatarContainer}>
          <RNImage 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnvVnLuuxZIpQrFtv-s7fhB6O4Bu-rrZKWYN5IuL9VfnJl150GkLFUkz65A8ISod5IMH-e6x5QbemTHSpconZAQagoSVGxzk5HdFgIHcoVj4DJSexBpCNzdN4e3RWb9lEJLZXWIrCLClFY2OqcrHJ31zgQ_qwdh8y52GirnXKq5Ep0Ef7wmsLCbsS2epHPbsUWMmARvp4vzt5R6dbctYCsD9FWySPqsOuSaX_vB3DUqat_nzh6xQ5QT-wwByJCE_g4ifsGlYM7GQ' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Emotional Atmosphere Visual */}
        <View style={styles.visualContainer}>
          <RNImage 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkW7b-orl7V0eoCW_rcf9iU_9zzKV3gazx8E2t6eDz05FzUY2BgKN4d8iKU2Mo0i-B763pKm7LVNr8B1UtLH2nwrNCpzNBftE8oARxff3kaYqxogzxwZ8IwhXrk8YqnZmUKg1uS3yXp6gf4NTpQxtTcnWdB7GKOuazJjRx1Z9QQirV-TdN9eWxGVz-AsUrdUfZpRi0Ew8iD_fd_Iloq3Ri97ykk6Xa-EzGxu9_cIKCKtutfTK7Hnv4aHIvTCs1Qu3zBlyXYDJ8sg' }}
            style={styles.visualImage}
          />
          <View style={styles.visualOverlay} />
          <View style={styles.visualTextContainer}>
            <Text style={styles.visualLabel}>SHARED SPACE</Text>
            <Text style={styles.visualTitle}>Drafting a moment for us.</Text>
          </View>
        </View>

        {/* Prompt Input Area */}
        <View style={styles.inputSection}>
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>DESCRIBE YOUR HEART</Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Tell the AI what's on your mind... like 'a thank you for the coffee this morning' or 'I miss our weekend walks'."
              placeholderTextColor="rgba(197, 197, 216, 0.4)"
              value={prompt}
              onChangeText={setPrompt}
            />
          </View>

          {/* Mood Chips */}
          <View style={styles.chipContainer}>
            {MOOD_CHIPS.map((chip) => {
              const isActive = selectedChip === chip;
              return (
                <TouchableOpacity 
                  key={chip}
                  onPress={() => setSelectedChip(chip)}
                  style={[styles.chip, isActive ? styles.activeChip : styles.inactiveChip]}
                >
                  <Text style={[styles.chipText, isActive ? styles.activeChipText : styles.inactiveChipText]}>
                    {chip}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={styles.generateButton}>
          <Text style={styles.generateButtonText}>GENERATE LETTER</Text>
        </TouchableOpacity>

        {/* AI Preview Card */}
        <View style={styles.previewSection}>
          <View style={styles.previewHeader}>
            <Sparkles color="rgba(197, 197, 216, 0.6)" size={14} />
            <Text style={styles.previewLabel}>PREVIEW DRAFT</Text>
          </View>

          <View style={styles.previewCard}>
            <View style={styles.previewGlow} />
            <Text style={styles.previewText}>
              Dearest,{'\n\n'}
              I've been thinking about the way the light hits the kitchen in the morning. Even when we're just sitting there in silence, there's a certain peace I only find with you. I wanted to tell you how much I appreciate those quiet moments we share.
              {cursorVisible ? <Text style={styles.cursor}>|</Text> : <Text style={styles.cursorHidden}>|</Text>}
            </Text>

            <View style={styles.previewFooter}>
              <View style={styles.previewActions}>
                <TouchableOpacity style={styles.iconBtn}>
                  <RefreshCw color="rgba(197, 197, 216, 0.6)" size={20} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <Edit2 color="rgba(197, 197, 216, 0.6)" size={20} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.sendButton}>
                <Text style={styles.sendButtonText}>SEND NOW</Text>
                <Send color={theme.colors.primary} size={16} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(20, 19, 18, 0.5)',
    zIndex: 50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 32,
    color: theme.colors.primary,
    fontWeight: '600',
    letterSpacing: -0.5,
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
  scrollContent: {
    paddingTop: 110,
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  visualContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(228, 228, 204, 0.1)',
    marginBottom: 32,
  },
  visualImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  visualOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  visualTextContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  visualLabel: {
    color: 'rgba(197, 197, 216, 0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  visualTitle: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 32,
  },
  inputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  inputLabel: {
    color: 'rgba(197, 197, 216, 0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 16,
  },
  textInput: {
    color: theme.colors.primary,
    fontSize: 20,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: 'rgba(236, 185, 196, 0.2)',
    borderColor: 'rgba(236, 185, 196, 0.4)',
  },
  inactiveChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  activeChipText: {
    color: theme.colors.primary,
  },
  inactiveChipText: {
    color: theme.colors.secondary,
  },
  generateButton: {
    backgroundColor: '#e4e4cc',
    width: '100%',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  generateButtonText: {
    color: '#646652',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  previewSection: {
    marginBottom: 32,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  previewLabel: {
    color: 'rgba(197, 197, 216, 0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(228, 228, 204, 0.1)',
    overflow: 'hidden',
  },
  previewGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(236, 185, 196, 0.1)',
  },
  previewText: {
    color: theme.colors.primary,
    fontSize: 20,
    lineHeight: 32,
    marginBottom: 24,
  },
  cursor: {
    color: theme.colors.primary,
  },
  cursorHidden: {
    color: 'transparent',
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 24,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconBtn: {
    padding: 8,
    marginLeft: -8,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
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
