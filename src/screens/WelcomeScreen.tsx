import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'es' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center px-4">
            <View className="w-full max-w-md items-center space-y-8">
                <Text className="text-3xl font-bold text-center text-gray-900">
                    {t('welcome.title')}
                </Text>

                <Text className="text-lg text-center text-gray-600 mt-4">
                    {t('welcome.subtitle')}
                </Text>

                <TouchableOpacity
                    onPress={toggleLanguage}
                    className="mt-8 bg-blue-600 px-6 py-3 rounded-lg active:bg-blue-700"
                >
                    <Text className="text-white font-semibold text-lg">
                        {t('change_language')} ({i18n.language.toUpperCase()})
                    </Text>
                </TouchableOpacity>

                <Text className="mt-4 text-sm text-gray-400">
                    {t('language')}: {i18n.language}
                </Text>
            </View>
        </SafeAreaView>
    );
}
