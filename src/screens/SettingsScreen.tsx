import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../components/ScreenHeader';
import { useProgram } from '../context/ProgramContext';
import { db } from '../db/client';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { Check, Languages, User, Database, Download, Upload } from 'lucide-react-native';
import { BackupService } from '../services/BackupService';
import { ConfirmationModal } from '../components/ConfirmationModal';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
];

export const SettingsScreen = () => {
    const { t, i18n } = useTranslation();
    const { reloadContext } = useProgram();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [settingsId, setSettingsId] = useState<number | null>(null);
    const [showImportConfirm, setShowImportConfirm] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await db.select().from(schema.user_settings).limit(1);
            if (settings.length > 0) {
                setName(settings[0].name || '');
                setSettingsId(settings[0].id);
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isLoading) return;

        const timer = setTimeout(() => {
            persistName(name);
        }, 800);

        return () => clearTimeout(timer);
    }, [name, isLoading]);

    const persistName = async (newName: string) => {
        try {
            let currentId = settingsId;
            if (!currentId) {
                const settings = await db.select().from(schema.user_settings).limit(1);
                if (settings.length > 0) {
                    currentId = settings[0].id;
                    setSettingsId(currentId);
                }
            }

            if (currentId) {
                await db.update(schema.user_settings)
                    .set({ name: newName })
                    .where(eq(schema.user_settings.id, currentId));
            } else {
                await db.insert(schema.user_settings).values({ name: newName, language: i18n.language });
                const settings = await db.select().from(schema.user_settings).limit(1);
                if (settings.length > 0) setSettingsId(settings[0].id);
            }
        } catch (error) {
            console.error('Failed to save settings', error);
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

    const handleExport = async () => {
        try {
            await BackupService.exportData();
            // Success message is handled by the share dialog usually, but we can show one if needed.
            // However, on Android/iOS, share sheet opening is the "success" of the generation.
        } catch (error) {
            Alert.alert(t('common.error'), t('settings.exportError'));
        }
    };

    const handleImport = () => {
        setShowImportConfirm(true);
    };

    const confirmImport = async () => {
        setShowImportConfirm(false);
        try {
            const success = await BackupService.importData();
            if (success) {
                await reloadContext();
                Alert.alert(t('common.done'), t('settings.importSuccess'));
                loadSettings();
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('settings.importError'));
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

                {/* Data Management Section */}
                <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <Database size={20} color="#a1a1aa" />
                        <Text className="text-zinc-400 text-sm font-bold uppercase ml-2">{t('settings.dataManagement')}</Text>
                    </View>

                    <View className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                        <TouchableOpacity
                            className="p-4 flex-row justify-between items-center border-b border-zinc-800"
                            onPress={handleExport}
                        >
                            <View className="flex-row items-center">
                                <Upload size={20} color="#3b82f6" className="mr-3" />
                                <Text className="text-zinc-50 font-medium text-lg ml-3">{t('settings.exportData')}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="p-4 flex-row justify-between items-center"
                            onPress={handleImport}
                        >
                            <View className="flex-row items-center">
                                <Download size={20} color="#3b82f6" className="mr-3" />
                                <Text className="text-zinc-50 font-medium text-lg ml-3">{t('settings.importData')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <ConfirmationModal
                visible={showImportConfirm}
                title={t('common.areYouSure')}
                message={t('settings.confirmImport')}
                confirmText={t('common.confirm')}
                cancelText={t('common.cancel')}
                confirmButtonColor="red"
                onConfirm={confirmImport}
                onCancel={() => setShowImportConfirm(false)}
            />
        </SafeAreaView>
    );
};
