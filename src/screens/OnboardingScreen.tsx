import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { theme } from '../theme/theme';
import { ArrowRight, Sparkles, Heart, Calendar, Link } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  createRelationship,
  joinRelationship,
  formatInviteCode,
  normalizeInviteCode,
} from '../services/relationshipService';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STEPS = [
  { id: 'name', title: 'What should we call you?', icon: Sparkles },
  { id: 'partner', title: "Who's your person?", icon: Heart },
  { id: 'anniversary', title: 'When did it all begin?', icon: Calendar },
  { id: 'invite', title: 'Invite your partner', icon: Link },
];

export const OnboardingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    name: '',
    partner: '',
    anniversary: '',
    inviteCode: '',
  });
  
  const { setUserName, setPartnerName, setAnniversary } = useAppContext();
  const { firebaseEnabled, user, refreshProfile } = useAuth();
  const [generatedCode, setGeneratedCode] = useState('');
  const [saving, setSaving] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(20);

    // Run enter animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep, fadeAnim, slideAnim]);

  const finishLocal = () => {
    if (answers.name) setUserName(answers.name);
    if (answers.partner) setPartnerName(answers.partner);
    if (answers.anniversary) setAnniversary(answers.anniversary);
    navigation.replace('MainApp');
  };

  const finishWithFirebase = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (answers.name) setUserName(answers.name);
      if (answers.partner) setPartnerName(answers.partner);
      if (answers.anniversary) setAnniversary(answers.anniversary);

      const joinCode = normalizeInviteCode(answers.inviteCode);
      if (joinCode.length >= 4) {
        await joinRelationship(user.uid, joinCode, answers.name || 'You');
      } else {
        const { inviteCode } = await createRelationship(user.uid, {
          displayName: answers.name || 'You',
          partnerDisplayName: answers.partner || 'Partner',
          anniversary: answers.anniversary,
        });
        setGeneratedCode(inviteCode);
        Alert.alert(
          'Invite your partner',
          `Share this code so they can join:\n\n${formatInviteCode(inviteCode)}`
        );
      }
      await refreshProfile();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not set up your sanctuary.';
      Alert.alert('Setup failed', message);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }
    if (firebaseEnabled) {
      finishWithFirebase();
    } else {
      finishLocal();
    }
  };

  const displayCode = generatedCode
    ? formatInviteCode(generatedCode)
    : 'Create account to get your code';

  const handleShareCode = async () => {
    if (!generatedCode) return;
    await Share.share({
      message: `Join me on BETWEEN! Invite code: ${formatInviteCode(generatedCode)}`,
    });
  };

  const currentStepData = STEPS[currentStep];
  const StepIcon = currentStepData.icon;

  const renderInput = () => {
    switch (currentStepData.id) {
      case 'name':
        return (
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={answers.name}
            onChangeText={(text) => setAnswers({ ...answers, name: text })}
            autoFocus
          />
        );
      case 'partner':
        return (
          <TextInput
            style={styles.input}
            placeholder="Partner's Name"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={answers.partner}
            onChangeText={(text) => setAnswers({ ...answers, partner: text })}
            autoFocus
          />
        );
      case 'anniversary':
        return (
          <TextInput
            style={styles.input}
            placeholder="DD / MM / YYYY"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={answers.anniversary}
            onChangeText={(text) => setAnswers({ ...answers, anniversary: text })}
            keyboardType="numbers-and-punctuation"
            autoFocus
          />
        );
      case 'invite':
        return (
          <View style={styles.inviteContainer}>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>
                {firebaseEnabled
                  ? 'Skip below to create a code, or enter your partner\'s code'
                  : displayCode}
              </Text>
            </View>
            {firebaseEnabled && (
              <Text style={styles.hintText}>
                Leave code empty → we create one when you tap Enter Sanctuary. Your partner enters that code on their phone.
              </Text>
            )}
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareCode}
              disabled={!generatedCode}
            >
              <Text style={styles.shareButtonText}>Share Invite Code</Text>
            </TouchableOpacity>
            
            <Text style={styles.orText}>OR ENTER THEIR CODE</Text>
            
            <TextInput
              style={[styles.input, { textAlign: 'center', marginTop: 10 }]}
              placeholder="Paste Code Here"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={answers.inviteCode}
              onChangeText={(text) => setAnswers({ ...answers, inviteCode: text })}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress Indicators */}
      <View style={styles.progressContainer}>
        {STEPS.map((step, index) => (
          <View
            key={step.id}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive,
              index < currentStep && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.iconWrapper}>
          <StepIcon color={theme.colors.primary} size={32} />
        </View>

        <Text style={styles.title}>{currentStepData.title}</Text>
        
        {renderInput()}

      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.nextButton, saving && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === STEPS.length - 1 ? 'Enter Sanctuary' : 'Continue'}
              </Text>
              {currentStep < STEPS.length - 1 && (
                <ArrowRight color={theme.colors.background} size={20} />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.glassBorder,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  progressDotCompleted: {
    backgroundColor: theme.colors.primary,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.containerPadding,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 245, 220, 0.05)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 1,
  },
  input: {
    width: '100%',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    color: theme.colors.primary,
    fontSize: 24,
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center',
  },
  inviteContainer: {
    width: '100%',
    alignItems: 'center',
  },
  codeBox: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  codeText: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 4,
  },
  shareButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 40,
  },
  shareButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  orText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 10,
  },
  hintText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  footer: {
    paddingHorizontal: theme.spacing.containerPadding,
    paddingBottom: 50,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: theme.roundness.full,
    gap: 8,
  },
  nextButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
