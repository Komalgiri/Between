import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PrivateVaultScreen } from '../screens/PrivateVaultScreen';
import { AnniversaryScreen } from '../screens/AnniversaryScreen';
import { CreateMemoryScreen } from '../screens/CreateMemoryScreen';
import { StoryGeneratorScreen } from '../screens/StoryGeneratorScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PlayHubScreen } from '../screens/PlayHubScreen';
import { SharedStoryScreen } from '../screens/SharedStoryScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { ShareMomentScreen } from '../screens/ShareMomentScreen';
import { LoadingScreen } from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  MainApp: undefined;
  PrivateVault: undefined;
  Anniversary: undefined;
  CreateMemory: undefined;
  StoryGenerator: undefined;
  PlayHub: undefined;
  SharedStory: undefined;
  ShareMoment: { imageUri: string };
  Settings: undefined;
  HomeTab: undefined;
  MoodTab: undefined;
  TimelineTab: undefined;
  LettersTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'fade',
    }}
  >
    <Stack.Screen name="MainApp" component={TabNavigator} />
    <Stack.Screen
      name="PrivateVault"
      component={PrivateVaultScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen
      name="Anniversary"
      component={AnniversaryScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="CreateMemory"
      component={CreateMemoryScreen}
      options={{
        presentation: 'fullScreenModal',
        animation: 'slide_from_bottom',
      }}
    />
    <Stack.Screen
      name="StoryGenerator"
      component={StoryGeneratorScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen
      name="PlayHub"
      component={PlayHubScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="SharedStory"
      component={SharedStoryScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen
      name="ShareMoment"
      component={ShareMomentScreen}
      options={{
        presentation: 'fullScreenModal',
        animation: 'slide_from_bottom',
      }}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </Stack.Navigator>
);

export const RootNavigator = () => {
  const { firebaseEnabled, user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // No Firebase keys → local-only app (original behavior)
  if (!firebaseEnabled) {
    return (
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainApp" component={TabNavigator} />
        <Stack.Screen name="PrivateVault" component={PrivateVaultScreen} />
        <Stack.Screen name="Anniversary" component={AnniversaryScreen} />
        <Stack.Screen name="CreateMemory" component={CreateMemoryScreen} />
        <Stack.Screen name="StoryGenerator" component={StoryGeneratorScreen} />
        <Stack.Screen name="PlayHub" component={PlayHubScreen} />
        <Stack.Screen name="SharedStory" component={SharedStoryScreen} />
        <Stack.Screen
          name="ShareMoment"
          component={ShareMomentScreen}
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    );
  }

  if (!profile?.relationshipId) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    );
  }

  return <AppStack />;
};
