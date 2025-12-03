import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import './src/i18n';
import { WelcomeScreen } from './src/screens';

export default function App() {
  return (
    <View className="flex-1 bg-zinc-950">
      <WelcomeScreen />
      <StatusBar style="light" />
    </View>
  );
}