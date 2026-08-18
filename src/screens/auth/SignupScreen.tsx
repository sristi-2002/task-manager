import React from 'react';
import {View, Text, Button} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const SignupScreen = () => {
  const navigation = useNavigation();

  return (
    <View>
      <Text>Signup Screen</Text>

      <Button
        title="Back to Login"
        onPress={() => navigation.navigate('Login' as never)}
      />
    </View>
  );
};

export default SignupScreen;