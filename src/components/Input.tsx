import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import {useTheme} from '../theme/useTheme';

type Props = TextInputProps & {label: string; error?: string | null};

export const Input = ({label, error, style, ...rest}: Props) => {
  const {palette, tokens} = useTheme();

  return (
    <View style={{marginBottom: tokens.spacing.md}}>
      <Text
        style={{
          color: palette.textMuted,
          fontSize: tokens.fontSize.xs,
          fontWeight: '600',
          marginBottom: tokens.spacing.xs,
        }}>
        {label.toUpperCase()}
      </Text>

      <TextInput
        placeholderTextColor={palette.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: palette.surface,
            borderColor: error ? palette.danger : palette.border,
            borderRadius: tokens.radius.md,
            color: palette.text,
            fontSize: tokens.fontSize.md,
            paddingHorizontal: tokens.spacing.md,
          },
          style,
        ]}
        {...rest}
      />

      {error ? (
        <Text
          style={{
            color: palette.danger,
            fontSize: tokens.fontSize.xs,
            marginTop: tokens.spacing.xs,
          }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({input: {borderWidth: 1, minHeight: 48}});
