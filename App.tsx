import './global.css';

import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from './src/db/client';
import migrations from './drizzle/migrations';
import { useEffect, useState } from 'react';
import { seedDatabase } from './src/db/seed';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  const { success, error } = useMigrations(db, migrations);
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    if (success) {
      seedDatabase().then(() => setIsSeeded(true));
    }
  }, [success]);

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-red-100">
        <Text className="text-red-500">Migration Error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-blue-500">Initializing Database...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}