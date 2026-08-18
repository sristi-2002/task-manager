import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text} from 'react-native';

import {useTheme} from '../theme/useTheme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
};

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
}: Props) => {
  const {palette, tokens} = useTheme();
  const inactive = disabled || loading;

  const background =
    variant === 'primary'
      ? palette.primary
      : variant === 'danger'
      ? palette.danger
      : 'transparent';

  const textColor = variant === 'secondary' ? palette.text : palette.onPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{disabled: !!inactive, busy: !!loading}}
      disabled={inactive}
      onPress={onPress}
      style={({pressed}) => [
        styles.base,
        {
          backgroundColor: background,
          borderColor: variant === 'secondary' ? palette.border : background,
          borderRadius: tokens.radius.md,
          opacity: inactive ? 0.5 : pressed ? 0.85 : 1,
          paddingHorizontal: tokens.spacing.lg,
        },
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={{
            color: textColor,
            fontSize: tokens.fontSize.md,
            fontWeight: '600',
          }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderWidth: 1,
    height: 50,
    justifyContent: 'center',
  },
});
