import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme/theme';
import { ArrowLeft, Bell, Heart, Shield, LogOut, Mail, KeyRound } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { sendPasswordReset } from '../services/authService';
import { unlinkPartner } from '../services/relationshipService';
import { appMeta } from '../config/firebaseEnv';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const SettingsScreen = () => {
  const navigation = useNavigation<Nav>();
  const { cuteNotificationsEnabled, setCuteNotificationsEnabled, biometricUnlockEnabled, setBiometricUnlockEnabled, relationshipId } = useAppContext();
  const { firebaseEnabled, signOut, user, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) {
      Alert.alert('No email', 'Sign in with email to reset your password.');
      return;
    }
    try {
      await sendPasswordReset(user.email);
      Alert.alert('Check your inbox', `We sent a reset link to ${user.email}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not send reset email.';
      Alert.alert('Reset failed', message);
    }
  };

  const handleUnlink = () => {
    if (!firebaseEnabled || !user || !relationshipId) {
      Alert.alert('Offline mode', 'Sign in and pair with Firebase to unlink.');
      return;
    }

    Alert.alert(
      'Unlink partner?',
      'You will leave this sanctuary. Your partner keeps their account but you will need to set up again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await unlinkPartner(user.uid, relationshipId);
              await refreshProfile();
              navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
            } catch (e: unknown) {
              const message = e instanceof Error ? e.message : 'Could not unlink.';
              Alert.alert('Failed', message);
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell color={theme.colors.secondary} size={18} />
            <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Cute Notifications</Text>
              <Text style={styles.settingDescription}>
                Saved locally for now. Push alerts coming in a future update.
              </Text>
            </View>
            <Switch
              value={cuteNotificationsEnabled}
              onValueChange={setCuteNotificationsEnabled}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.tertiary }}
              thumbColor={theme.colors.primary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield color={theme.colors.secondary} size={18} />
            <Text style={styles.sectionTitle}>PRIVACY & SECURITY</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Biometric Unlock</Text>
              <Text style={styles.settingDescription}>
                Require Face ID or fingerprint to open the Private Vault.
              </Text>
            </View>
            <Switch
              value={biometricUnlockEnabled}
              onValueChange={setBiometricUnlockEnabled}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.tertiary }}
              thumbColor={theme.colors.primary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart color={theme.colors.secondary} size={18} />
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
          </View>

          {firebaseEnabled && user?.email && (
            <TouchableOpacity style={styles.buttonRow} onPress={handlePasswordReset}>
              <View style={styles.buttonRowLeft}>
                <KeyRound color={theme.colors.primary} size={18} />
                <Text style={styles.buttonText}>Reset password</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.buttonRow} onPress={handleUnlink} disabled={busy}>
            {busy ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Text style={styles.buttonText}>Unlink Partner</Text>
            )}
          </TouchableOpacity>

          {firebaseEnabled && (
            <TouchableOpacity style={styles.buttonRow} onPress={() => signOut()}>
              <Text style={[styles.buttonText, { color: '#ff6b6b' }]}>Log Out</Text>
              <LogOut color="#ff6b6b" size={18} />
            </TouchableOpacity>
          )}
        </View>

        {appMeta.supportEmail ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Mail color={theme.colors.secondary} size={18} />
              <Text style={styles.sectionTitle}>SUPPORT</Text>
            </View>
            <Text style={styles.supportText}>{appMeta.supportEmail}</Text>
            <Text style={styles.supportHint}>{appMeta.projectName} · {appMeta.projectNumber}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(20, 19, 18, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: '500',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'rgba(197, 197, 216, 0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingLabel: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    color: 'rgba(197, 197, 216, 0.6)',
    fontSize: 12,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
    minHeight: 56,
  },
  buttonRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  supportText: {
    color: theme.colors.primary,
    fontSize: 15,
  },
  supportHint: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 6,
  },
});
