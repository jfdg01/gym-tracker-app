import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../components/ScreenHeader';
import { db } from '../db/client';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { Check, Languages, User } from 'lucide-react-native';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
];

export const SettingsScreen = () => {
    const { t, i18n } = useTranslation();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await db.select().from(schema.user_settings).limit(1);
            if (settings.length > 0) {
                setName(settings[0].name || '');
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveSettings = async () => {
        try {
            const settings = await db.select().from(schema.user_settings).limit(1);
            if (settings.length > 0) {
                await db.update(schema.user_settings)
                    .set({ name })
                    .where(eq(schema.user_settings.id, settings[0].id));
            } else {
                await db.insert(schema.user_settings).values({ name, language: i18n.language });
            }
            Alert.alert(t('common.success'), t('settings.saved'));
        } catch (error) {
            console.error('Failed to save settings', error);
            Alert.alert(t('common.error'), t('settings.saveError'));
        }
    };

    const changeLanguage = async (langCode: string) => {
        await i18n.changeLanguage(langCode);
        try {
            const settings = await db.select().from(schema.user_settings).limit(1);
            if (settings.length > 0) {
                await db.update(schema.user_settings)
                    .set({ language: langCode })
                    .where(eq(schema.user_settings.id, settings[0].id));
            } else {
                await db.insert(schema.user_settings).values({ language: langCode, name });
            }
        } catch (error) {
            console.error('Failed to save language preference', error);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-zinc-950 justify-center items-center">
                <Text className="text-zinc-50">{t('common.loading')}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top', 'left', 'right', 'bottom']}>
            <ScreenHeader
                title={t('settings.title')}
                subtitle={t('common.appName')}
            />

            <ScrollView className="flex-1 px-6 pt-6">
                {/* User Profile Section */}
                <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <User size={20} color="#a1a1aa" />
                        <Text className="text-zinc-400 text-sm font-bold uppercase ml-2">{t('settings.profile')}</Text>
                    </View>

                    <View className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                        <Text className="text-zinc-500 text-xs mb-2">{t('settings.nameLabel')}</Text>
                        <TextInput
                            className="bg-zinc-950 text-zinc-50 p-4 rounded-lg border border-zinc-800 text-lg"
                            value={name}
                            onChangeText={setName}
                            placeholder={t('settings.namePlaceholder')}
                            placeholderTextColor="#52525b"
                        />
                        <TouchableOpacity
                            className="bg-blue-600 mt-4 p-3 rounded-lg items-center active:bg-blue-500"
                            onPress={saveSettings}
                        >
                            <Text className="text-white font-bold">{t('common.save')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Language Section */}
                <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <Languages size={20} color="#a1a1aa" />
                        <Text className="text-zinc-400 text-sm font-bold uppercase ml-2">{t('settings.language')}</Text>
                    </View>

                    <View className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                        {LANGUAGES.map((lang, index) => (
                            <TouchableOpacity
                                key={lang.code}
                                className={`p-4 flex-row justify-between items-center ${index !== LANGUAGES.length - 1 ? 'border-b border-zinc-800' : ''} ${i18n.language === lang.code ? 'bg-zinc-800' : ''}`}
                                onPress={() => changeLanguage(lang.code)}
                            >
                                <Text className="text-zinc-50 font-medium text-lg">{lang.label}</Text>
                                {i18n.language === lang.code && (
                                    <Check size={20} color="#3b82f6" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
