import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NewsFeedScreen } from './src/screens/NewsFeedScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#121214" />
      <NewsFeedScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
});
