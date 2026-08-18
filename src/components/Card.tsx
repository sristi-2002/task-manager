import React from 'react';
import {StyleSheet, View, type ViewStyle} from 'react-native';

import {useTheme} from '../theme/useTheme';

export const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) => {
  const {palette, tokens} = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          borderRadius: tokens.radius.md,
          padding: tokens.spacing.md,
        },
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {borderWidth: StyleSheet.hairlineWidth},
});
