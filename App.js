import './global.css';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-red-300 p-10 text-center">Esta es un template con Tailwind funcionando</Text>
      <StatusBar style="auto" />
    </View>
  );
}