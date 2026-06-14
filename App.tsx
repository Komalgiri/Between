import React, { useEffect, useRef, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  Image as RNImage,
} from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { theme } from './src/theme/theme';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { AppContextProvider } from './src/context/AppContext';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(20)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Splash Screen Animation — staggered cinematic reveal
    Animated.sequence([
      // Step 1: Logo fades in + scales
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Step 2: "BETWEEN" text slides up + fades in
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(titleSlide, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
      // Step 3: Tagline fades in
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate to Onboarding after 4 seconds
    if (showSplash) {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(titleFade, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(taglineFade, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => {
          setShowSplash(false);
        });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [fadeAnim, scaleAnim, titleFade, titleSlide, taglineFade, showSplash]);

  if (!showSplash) {
    return (
      <AuthProvider>
        <AppContextProvider>
          <SafeAreaProvider>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </AppContextProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <AppContextProvider>
        <SafeAreaProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor={theme.colors.background}
          />
        <View style={styles.container}>
          {/* Logo — fades in + scales */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <RNImage
              source={require('./src/LOGO.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* "BETWEEN" — slides up + fades in after logo */}
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: titleFade,
                transform: [{ translateY: titleSlide }],
              }
            ]}
          >
            BETWEEN
          </Animated.Text>

          {/* Tagline — fades in last */}
          <Animated.View style={[styles.textContainer, { opacity: taglineFade }]}>
            <View style={styles.divider} />
            <Text style={styles.tagline}>Intimacy OS</Text>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.bottomBlur, { opacity: taglineFade }]}>
            <Text style={styles.footerText}>A PRIVATE SANCTUARY</Text>
          </Animated.View>
        </View>
        </SafeAreaProvider>
      </AppContextProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 36,
    color: theme.colors.primary,
    fontWeight: '600',
    letterSpacing: 14,
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: theme.colors.onSurfaceVariant,
    opacity: 0.3,
    marginBottom: 16,
  },
  tagline: {
    fontSize: theme.typography.labelCaps.fontSize,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  bottomBlur: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    opacity: 0.5,
    letterSpacing: 6,
    fontWeight: '600',
  },
});

export default App;
