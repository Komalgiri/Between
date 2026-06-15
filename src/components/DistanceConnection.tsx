import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Smile, Frown, Heart } from 'lucide-react-native';
import { theme } from '../theme/theme';

const TOGETHER_KM = 0.5;
const SLOT_WIDTH = 72;

type Props = {
  userName: string;
  partnerName: string;
  distanceKm: number | null;
  distanceLabel: string;
  distanceLive: boolean;
  onPress?: () => void;
  compact?: boolean;
};

const AvatarBubble = ({
  initial,
  happy,
  waiting,
  accent,
  compact,
}: {
  initial: string;
  happy: boolean;
  waiting: boolean;
  accent: string;
  compact?: boolean;
}) => {
  const MoodIcon = waiting ? Heart : happy ? Smile : Frown;
  const moodColor = waiting
    ? theme.colors.onSurfaceVariant
    : happy
      ? theme.colors.tertiary
      : theme.colors.secondary;

  return (
    <View style={[styles.avatarRing, compact && styles.avatarRingCompact, { borderColor: accent }]}>
      <View style={[styles.avatarInner, compact && styles.avatarInnerCompact]}>
        <Text style={[styles.avatarInitial, compact && styles.avatarInitialCompact]}>{initial}</Text>
      </View>
      <View style={[styles.moodBadge, compact && styles.moodBadgeCompact]}>
        <MoodIcon color={moodColor} size={compact ? 10 : 14} strokeWidth={2.2} />
      </View>
    </View>
  );
};

export const DistanceConnection = ({
  userName,
  partnerName,
  distanceKm,
  distanceLabel,
  distanceLive,
  onPress,
  compact = false,
}: Props) => {
  const together = distanceKm !== null && distanceKm < TOGETHER_KM;
  const waiting = distanceKm === null;
  const happy = together && distanceLive;
  const apart = distanceKm !== null && !together;

  const spread = useRef(new Animated.Value(apart ? 1 : 0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(spread, {
      toValue: apart ? 1 : 0,
      friction: 7,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [apart, spread]);

  useEffect(() => {
    if (!happy) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [happy, pulse]);

  const userInitial = userName.trim().charAt(0).toUpperCase() || '?';
  const partnerInitial = partnerName.trim().charAt(0).toUpperCase() || '?';

  const userShift = spread.interpolate({
    inputRange: [0, 1],
    outputRange: [compact ? 14 : 28, compact ? -16 : -48],
  });
  const partnerShift = spread.interpolate({
    inputRange: [0, 1],
    outputRange: [compact ? -14 : -28, compact ? 16 : 48],
  });

  const statusEyebrow = waiting ? 'CONNECTING' : together ? 'TOGETHER' : 'DISTANCED';
  const centerLabel = waiting ? '···' : together ? '' : distanceLabel;
  const centerSub = waiting
    ? 'Tap to connect'
    : together
      ? 'Right beside each other'
      : distanceLive
        ? 'Apart right now'
        : 'Waiting for locations';

  const content = (
    <View style={styles.block}>
      <View style={[styles.avatarRow, compact && styles.avatarRowCompact]}>
        <Animated.View
          style={[styles.sideSlot, compact && styles.sideSlotCompact, { transform: [{ translateX: userShift }] }]}
        >
          <AvatarBubble
            initial={userInitial}
            happy={happy}
            waiting={waiting}
            accent={theme.colors.tertiary}
            compact={compact}
          />
        </Animated.View>

        <Animated.View
          style={[styles.centerSlot, compact && styles.centerSlotCompact, happy && { transform: [{ scale: pulse }] }]}
        >
          {together && !waiting ? (
            <Heart color={theme.colors.tertiary} size={compact ? 12 : 18} fill={theme.colors.tertiary} />
          ) : null}
          {centerLabel ? (
            <Text style={[styles.centerLabel, compact && styles.centerLabelCompact]}>{centerLabel}</Text>
          ) : null}
        </Animated.View>

        <Animated.View
          style={[styles.sideSlot, compact && styles.sideSlotCompact, { transform: [{ translateX: partnerShift }] }]}
        >
          <AvatarBubble
            initial={partnerInitial}
            happy={happy}
            waiting={waiting}
            accent={theme.colors.secondary}
            compact={compact}
          />
        </Animated.View>
      </View>

      {!compact && (
        <View style={styles.namesRow}>
          <Text style={styles.sideName} numberOfLines={1}>
            {userName}
          </Text>
          <Text style={styles.centerSub} numberOfLines={2}>
            {centerSub}
          </Text>
          <Text style={[styles.sideName, styles.sideNameRight]} numberOfLines={1}>
            {partnerName}
          </Text>
        </View>
      )}
    </View>
  );

  if (compact) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.compactWrap}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.card, distanceLive && !waiting && styles.cardLive]}
    >
      <Text
        style={[
          styles.cardEyebrow,
          together && !waiting && styles.cardEyebrowTogether,
          apart && styles.cardEyebrowDistanced,
        ]}
      >
        {statusEyebrow}
      </Text>
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
    paddingVertical: 28,
    paddingHorizontal: 12,
    borderRadius: theme.roundness.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  cardLive: {
    borderColor: 'rgba(216, 167, 177, 0.35)',
    backgroundColor: 'rgba(216, 167, 177, 0.04)',
  },
  cardEyebrow: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 20,
  },
  cardEyebrowTogether: {
    color: theme.colors.tertiary,
  },
  cardEyebrowDistanced: {
    color: theme.colors.secondary,
  },
  block: {
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRowCompact: {
    gap: 0,
  },
  sideSlot: {
    width: SLOT_WIDTH,
    alignItems: 'center',
  },
  sideSlotCompact: {
    width: 36,
  },
  centerSlot: {
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  centerSlotCompact: {
    minWidth: 48,
    gap: 2,
  },
  centerLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  centerLabelCompact: {
    fontSize: 10,
    fontWeight: '700',
  },
  namesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
    maxWidth: SLOT_WIDTH * 2 + 88,
  },
  sideName: {
    width: SLOT_WIDTH,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
    textAlign: 'center',
  },
  sideNameRight: {
    textAlign: 'center',
  },
  centerSub: {
    flex: 1,
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 2,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  avatarRingCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInnerCompact: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  avatarInitialCompact: {
    fontSize: 11,
  },
  moodBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodBadgeCompact: {
    width: 13,
    height: 13,
    borderRadius: 7,
    bottom: -3,
    right: -3,
  },
  compactWrap: {
    paddingHorizontal: 2,
  },
});
