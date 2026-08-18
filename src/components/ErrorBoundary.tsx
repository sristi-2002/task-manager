import React from 'react';
import {Text, View} from 'react-native';

import {logger} from '../utils/logger';

type Props = {children: React.ReactNode};
type State = {hasError: boolean};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {hasError: false};

  static getDerivedStateFromError(): State {
    return {hasError: true};
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error('Unhandled UI error', error, info.componentStack);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            padding: 24,
          }}>
          <Text style={{fontSize: 18, fontWeight: '600'}}>
            Something went wrong
          </Text>
          <Text style={{marginTop: 8, textAlign: 'center'}}>
            Please restart the app. Your tasks are saved locally and will not be
            lost.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
