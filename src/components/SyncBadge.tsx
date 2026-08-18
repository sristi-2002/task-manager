import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {useTheme} from '../theme/useTheme';

export type SyncBadgeStatus = 'idle' | 'syncing' | 'error' | 'offline';

export const SyncBadge = ({
  status,
  pendingCount,
}: {
  status: SyncBadgeStatus;
  pendingCount: number;
}) => {
  const {palette, tokens} = useTheme();

  const {label, color} = (() => {
    switch (status) {
      case 'syncing':
        return {label: 'Syncing…', color: palette.primary};
      case 'error':
        return {label: 'Sync failed', color: palette.danger};
      case 'offline':
        return {
          label:
            pendingCount > 0 ? `Offline · ${pendingCount} pending` : 'Offline',
          color: palette.warning,
        };
      default:
        return pendingCount > 0
          ? {label: `${pendingCount} pending`, color: palette.warning}
          : {label: 'All synced', color: palette.success};
    }
  })();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: palette.surfaceAlt,
          borderRadius: tokens.radius.pill,
          paddingHorizontal: tokens.spacing.sm,
        },
      ]}>
      <View style={[styles.dot, {backgroundColor: color}]} />
      <Text
        style={{
          color: palette.textMuted,
          fontSize: tokens.fontSize.xs,
          fontWeight: '600',
        }}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    height: 26,
  },
  dot: {borderRadius: 4, height: 8, width: 8},
});
