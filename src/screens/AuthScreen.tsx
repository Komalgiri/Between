import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../theme/theme';
import { Heart } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export const AuthScreen = () => {
  const { signIn, signUp, loading } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signUp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || password.length < 6) {
      Alert.alert('Check your details', 'Use a valid email and password (6+ characters).');
      return;
    }
    if (mode === 'signUp' && !displayName.trim()) {
      Alert.alert('Your name', 'Add your name so your partner knows it is you.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signUp') {
        await signUp(email, password, displayName.trim());
      } else {
        await signIn(email, password);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong.';
      Alert.alert('Could not continue', message);
    } finally {
      setSubmitting(false);
    }
  };

  const busy = loading || submitting;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Heart color={theme.colors.tertiary} size={40} fill={theme.colors.tertiary} />
        <Text style={styles.title}>BETWEEN</Text>
        <Text style={styles.subtitle}>Sign in to sync with your partner</Text>
      </View>

      {mode === 'signUp' && (
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Password (6+ characters)"
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.primaryBtn, busy && styles.primaryBtnDisabled]}
        onPress={handleSubmit}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color={theme.colors.background} />
        ) : (
          <Text style={styles.primaryBtnText}>
            {mode === 'signUp' ? 'Create account' : 'Sign in'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode(mode === 'signUp' ? 'signIn' : 'signUp')}>
        <Text style={styles.switchText}>
          {mode === 'signUp'
            ? 'Already have an account? Sign in'
            : 'New here? Create an account'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.containerPadding,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    color: theme.colors.primary,
    fontWeight: '600',
    letterSpacing: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginTop: 8,
    textAlign: 'center',
  },
  input: {
    height: 52,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    backgroundColor: theme.colors.glass,
    paddingHorizontal: 16,
    color: theme.colors.primary,
    fontSize: 16,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.full,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: theme.colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
  switchText: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
});
