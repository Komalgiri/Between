import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image as RNImage,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../theme/theme';
import { X, Camera, MapPin, Heart, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import * as ImagePicker from 'expo-image-picker';

export const CreateMemoryScreen = () => {
  const navigation = useNavigation();
  const { partnerName, createMemory } = useAppContext();
  const [note, setNote] = useState('');
  const [location, setLocation] = useState('Home Sanctuary');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach a memory image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleShare = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await createMemory({
        note: note.trim(),
        location,
        mood: 'Atmospheric',
        localImageUri: imageUri,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Could not save', 'Check your connection and Firebase rules.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <X color={theme.colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Memory</Text>
        <TouchableOpacity
          style={[styles.publishButton, (!note.trim() || saving) && styles.publishButtonDisabled]}
          onPress={handleShare}
          disabled={!note.trim() || saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.colors.background} size="small" />
          ) : (
            <Text style={styles.publishText}>SHARE</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          {imageUri ? (
            <RNImage source={{ uri: imageUri }} style={styles.photoImage} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Camera color="rgba(197, 197, 216, 0.4)" size={48} strokeWidth={1} />
              <Text style={styles.photoHint}>Tap to add a moment</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputSection}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="What's the story behind this moment?"
              placeholderTextColor="rgba(197, 197, 216, 0.3)"
              multiline
              value={note}
              onChangeText={setNote}
              autoFocus
            />
          </View>
        </View>

        <View style={styles.metaSection}>
          <View style={styles.metaItem}>
            <View style={styles.metaIconWrapper}>
              <MapPin color={theme.colors.secondary} size={18} />
            </View>
            <View style={styles.metaTextWrapper}>
              <Text style={styles.metaLabel}>LOCATION</Text>
              <TextInput
                style={styles.metaValueInput}
                value={location}
                onChangeText={setLocation}
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
            </View>
          </View>

          <View style={styles.metaItem}>
            <View style={styles.metaIconWrapper}>
              <Sparkles color={theme.colors.tertiary} size={18} />
            </View>
            <View style={styles.metaTextWrapper}>
              <Text style={styles.metaLabel}>MOOD</Text>
              <Text style={styles.metaValue}>Atmospheric</Text>
            </View>
          </View>
        </View>

        <View style={styles.privacyNote}>
          <Heart color="rgba(216, 167, 177, 0.4)" size={14} fill="rgba(216, 167, 177, 0.1)" />
          <Text style={styles.privacyText}>
            This memory will only be visible to you and {partnerName}.
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(20, 19, 18, 0.8)',
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  publishButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 72,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    opacity: 0.3,
  },
  publishText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 32,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  photoHint: {
    color: 'rgba(197, 197, 216, 0.4)',
    fontSize: 14,
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 32,
  },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  textInput: {
    color: theme.colors.primary,
    fontSize: 18,
    lineHeight: 28,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  metaSection: {
    gap: 16,
    marginBottom: 32,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  metaIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  metaTextWrapper: {
    flex: 1,
  },
  metaLabel: {
    color: 'rgba(197, 197, 216, 0.4)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  metaValue: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  metaValueInput: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: 0.5,
  },
  privacyText: {
    color: 'rgba(197, 197, 216, 0.6)',
    fontSize: 12,
  },
});
