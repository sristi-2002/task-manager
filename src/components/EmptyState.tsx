import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {useTheme} from '../theme/useTheme';

export const EmptyState = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => {
  const {palette, tokens} = useTheme();

  return (
    <View style={[styles.wrap, {padding: tokens.spacing.xl}]}>
      <Text
        style={{
          color: palette.text,
          fontSize: tokens.fontSize.lg,
          fontWeight: '600',
        }}>
        {title}
      </Text>
      <Text
        style={{
          color: palette.textMuted,
          fontSize: tokens.fontSize.sm,
          marginTop: tokens.spacing.sm,
          textAlign: 'center',
        }}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {alignItems: 'center', flex: 1, justifyContent: 'center'},
});
