import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useTheme} from '../theme/useTheme';

export const Screen = ({children}: {children: React.ReactNode}) => {
  const {palette, scheme} = useTheme();

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: palette.background}]}
      edges={['top', 'bottom']}>
      {/* RN 0.87 is edge-to-edge: StatusBar no longer takes backgroundColor,
          the SafeAreaView background shows through instead. */}
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({safe: {flex: 1}, body: {flex: 1}});
