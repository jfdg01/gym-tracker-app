import './global.css';

import './src/i18n';
import i18n from './src/i18n';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db, expoDb } from './src/db/client';
import * as schema from './src/db/schema';
import migrations from './drizzle/migrations';
import { useEffect, useState } from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';
import * as SQLite from 'expo-sqlite';

export default function App() {
  const { success, error } = useMigrations(db, migrations);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  const resetDatabase = async () => {
    try {
      await expoDb.closeAsync();
      await SQLite.deleteDatabaseAsync('gym_tracker.db');
      Alert.alert('Success', 'Database deleted. Please restart the app.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  useEffect(() => {
    const loadLanguage = async () => {
      if (success) {
        try {
          const settings = await db.select().from(schema.user_settings).limit(1);
          if (settings.length > 0 && settings[0].language) {
            await i18n.changeLanguage(settings[0].language);
          }
        } catch (e) {
          console.error('Failed to load language preference', e);
        } finally {
          setIsLanguageLoaded(true);
        }
      }
    };
    loadLanguage();
  }, [success]);

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

  if (!success || !isLanguageLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-blue-500 mb-4">Initializing...</Text>
        {/* Only show reset option if it takes too long? For now keep it simple */}
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