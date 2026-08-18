import React, {Suspense} from 'react';
import {ActivityIndicator, View} from 'react-native';

const Fallback = () => (
  <View style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
    <ActivityIndicator />
  </View>
);

/**
 * Wraps a React.lazy screen so the navigator can mount it before its chunk
 * has resolved. Defined once so every navigator shares the same fallback.
 */
export const lazyScreen =
  <P extends object>(Component: React.ComponentType<P>) =>
  (props: P) =>
    (
      <Suspense fallback={<Fallback />}>
        <Component {...props} />
      </Suspense>
    );
