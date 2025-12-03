import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';

export const WelcomeScreen = () => {
    const { t } = useTranslation();

    return (
        <View className="flex-1 bg-zinc-950 px-6 justify-center items-center">
            <StatusBar style="light" />

            <View className="w-full items-center mb-12">
                <Text className="text-3xl font-bold text-zinc-50 text-center mb-4">
                    {t('welcome.title')}
                </Text>
                <Text className="text-zinc-400 text-center text-base px-4">
                    {t('welcome.subtitle')}
                </Text>
            </View>

            <TouchableOpacity
                className="w-full bg-blue-500 py-4 rounded-xl items-center active:opacity-90 shadow-sm"
                onPress={() => {
                    console.log('Get Started pressed');
                }}
            >
                <Text className="text-white font-bold text-lg">
                    {t('welcome.get_started')}
                </Text>
            </TouchableOpacity>
        </View>
    );
};
