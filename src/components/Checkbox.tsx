import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

import {useTheme} from '../theme/useTheme';

export const Checkbox = ({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) => {
  const {palette, tokens} = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{checked}}
      hitSlop={10}
      onPress={onToggle}
      style={[
        styles.box,
        {
          backgroundColor: checked ? palette.primary : 'transparent',
          borderColor: checked ? palette.primary : palette.border,
          borderRadius: tokens.radius.pill,
        },
      ]}>
      {checked ? (
        <Text style={{color: palette.onPrimary, fontSize: 14}}>✓</Text>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    borderWidth: 2,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
});
