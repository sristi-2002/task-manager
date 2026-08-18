import React from 'react';
import {View, Text, Button} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation();

  return (
    <View>
      <Text>Login Screen</Text>

      <Button
        title="Go to Signup"
        onPress={() => navigation.navigate('Signup' as never)}
      />
    </View>
  );
};

export default LoginScreen;