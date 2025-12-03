import './global.css';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import './src/i18n';
import { useTranslation } from 'react-i18next';

export default function App() {
  const [text, setText] = useState('');
  const { t, i18n } = useTranslation();

  const handleAddItem = async () => {
    if (!text) return;
    setText('');
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <View className="flex-1 bg-zinc-800 pt-12 px-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">{t('title')}</Text>
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => changeLanguage('en')}
            className={`px-2 py-1 rounded mr-2 ${i18n.language === 'en' ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <Text className={`${i18n.language === 'en' ? 'text-white' : 'text-black'}`}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => changeLanguage('es')}
            className={`px-2 py-1 rounded ${i18n.language === 'es' ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <Text className={`${i18n.language === 'es' ? 'text-white' : 'text-black'}`}>ES</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row mb-4">
        <TextInput
          className="flex-1 border border-gray-300 rounded p-2 mr-2"
          placeholder={t('placeholder')}
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity
          className="bg-blue-500 justify-center px-4 rounded"
          onPress={handleAddItem}
        >
          <Text className="text-white font-bold">{t('add')}</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}