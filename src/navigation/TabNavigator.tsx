import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Heart, Plus, Camera, MessageCircle } from 'lucide-react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { MoodSyncScreen } from '../screens/MoodSyncScreen';
import { MemoryTimelineScreen } from '../screens/MemoryTimelineScreen';
import { AILetterScreen } from '../screens/AILetterScreen';
import { theme } from '../theme/theme';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

const EmptyScreen = () => null;

export const TabNavigator = () => {
  const { shareMoment } = useAppContext();
  const { firebaseEnabled } = useAuth();

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'Camera access is needed to share moments!');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        await shareMoment(result.assets[0].uri);
        Alert.alert(
          'Moment shared',
          firebaseEnabled
            ? 'Your partner will see it on Home.'
            : 'Saved locally for this session.'
        );
      } catch {
        Alert.alert('Could not share', 'Check your connection and Firebase Storage setup.');
      }
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Home color={focused ? theme.colors.primary : theme.colors.secondary} size={24} />
          )
        }}
      />
      <Tab.Screen 
        name="MoodTab" 
        component={MoodSyncScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Heart color={focused ? theme.colors.primary : theme.colors.secondary} size={24} />
          )
        }}
      />
      
      {/* Floating Add Button */}
      <Tab.Screen 
        name="AddTab" 
        component={EmptyScreen}
        options={{
          tabBarIcon: () => (
            <View style={styles.addBtnWrapper}>
              <View style={styles.addBtnInner}>
                <Plus color={theme.colors.background} size={24} />
              </View>
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            openCamera();
          },
        })}
      />

      <Tab.Screen 
        name="TimelineTab" 
        component={MemoryTimelineScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Camera color={focused ? theme.colors.primary : theme.colors.secondary} size={24} />
          )
        }}
      />
      <Tab.Screen 
        name="LettersTab" 
        component={AILetterScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MessageCircle color={focused ? theme.colors.primary : theme.colors.secondary} size={24} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 20,
    right: 20,
    elevation: 0,
    backgroundColor: 'rgba(28, 28, 26, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 40,
    height: 70,
    paddingBottom: 0,
  },
  addBtnWrapper: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  }
});
