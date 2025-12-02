import './global.css';

import './src/i18n';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db, expoDb } from './src/db/client';
import migrations from './drizzle/migrations';
import { useEffect, useState } from 'react';
import { seedDatabase } from './src/db/seed';
import { RootNavigator } from './src/navigation/RootNavigator';
import * as SQLite from 'expo-sqlite';

export default function App() {
  const { success, error } = useMigrations(db, migrations);
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    if (success) {
      seedDatabase().then(() => setIsSeeded(true));
    }
  }, [success]);

  const resetDatabase = async () => {
    try {
      await expoDb.closeAsync();
      await SQLite.deleteDatabaseAsync('gym_tracker.db');
      Alert.alert('Success', 'Database deleted. Please restart the app.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-red-100 p-4">
        <Text className="text-red-500 mb-4 text-center">Migration Error: {error.message}</Text>
        <TouchableOpacity onPress={resetDatabase} className="bg-red-500 p-3 rounded">
          <Text className="text-white">Reset Database</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!success) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-blue-500 mb-4">Initializing Database...</Text>
        <TouchableOpacity onPress={resetDatabase} className="bg-red-500 p-3 rounded">
          <Text className="text-white">Reset Database</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}