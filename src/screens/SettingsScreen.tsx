import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { theme } from '../theme/theme';
import { ArrowLeft, Bell, Heart, Shield, LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const { cuteNotificationsEnabled, setCuteNotificationsEnabled } = useAppContext();
  const { firebaseEnabled, signOut } = useAuth();
  const [biometricLogin, setBiometricLogin] = useState(true);

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
        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell color={theme.colors.secondary} size={18} />
            <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Cute Notifications</Text>
              <Text style={styles.settingDescription}>Receive random sweet messages and memory reminders throughout the day.</Text>
            </View>
            <Switch
              value={cuteNotificationsEnabled}
              onValueChange={setCuteNotificationsEnabled}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.tertiary }}
              thumbColor={theme.colors.primary}
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield color={theme.colors.secondary} size={18} />
            <Text style={styles.sectionTitle}>PRIVACY & SECURITY</Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Biometric Unlock</Text>
              <Text style={styles.settingDescription}>Use FaceID or Fingerprint to unlock the Private Vault.</Text>
            </View>
            <Switch
              value={biometricLogin}
              onValueChange={setBiometricLogin}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.tertiary }}
              thumbColor={theme.colors.primary}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart color={theme.colors.secondary} size={18} />
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
          </View>
          
          <TouchableOpacity style={styles.buttonRow}>
            <Text style={styles.buttonText}>Unlink Partner</Text>
          </TouchableOpacity>
          {firebaseEnabled && (
            <TouchableOpacity style={styles.buttonRow} onPress={() => signOut()}>
              <Text style={[styles.buttonText, { color: '#ff6b6b' }]}>Log Out</Text>
              <LogOut color="#ff6b6b" size={18} />
            </TouchableOpacity>
          )}
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
  },
  buttonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});
