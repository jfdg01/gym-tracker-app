import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgram } from '../context/ProgramContext';
import { useLiveWorkout } from '../context/LiveWorkoutContext';
import { Globe, X, Dumbbell } from 'lucide-react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { HeaderAction } from '../components/HeaderAction';
import { db } from '../db/client';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
];

export const HomeScreen = () => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const { getCurrentDay, program, currentDayIndex, isLoading, completeDay, refreshProgram } = useProgram();

    useFocusEffect(
        useCallback(() => {
            refreshProgram();
        }, [refreshProgram])
    );
    const { startWorkout } = useLiveWorkout();

    if (isLoading) {
        return (
            <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className="flex-1 bg-zinc-950 px-6 justify-center items-center">
                <Text className="text-zinc-50">{t('common.loading')}</Text>
            </SafeAreaView>
        );
    }

    const currentDay = getCurrentDay();
    const hasProgram = program && program.length > 0 && currentDay;

    // Calculate previous day index only if we have a program
    const prevDayIndex = hasProgram ? (currentDayIndex - 1 + program.length) % program.length : -1;
    const prevDay = hasProgram ? program[prevDayIndex] : null;

    const handleStartWorkout = () => {
        if (!currentDay) return;

        if (currentDay.isRestDay) {
            alert(t('home.restDayAlert'));
            return;
        }

        startWorkout(currentDay.exercises);
        navigation.navigate('ActiveExercise' as never);
    };

    const changeLanguage = async (langCode: string) => {
        await i18n.changeLanguage(langCode);
        setLanguageModalVisible(false);
        try {
            const settings = await db.select().from(schema.user_settings).limit(1);
            if (settings.length > 0) {
                await db.update(schema.user_settings)
                    .set({ language: langCode })
                    .where(eq(schema.user_settings.id, settings[0].id));
            } else {
                // Should ideally exist if App.tsx/ProgramContext initialized it, but safe to insert if missing
                await db.insert(schema.user_settings).values({ language: langCode });
            }
        } catch (error) {
            console.error('Failed to save language preference', error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950 px-6" edges={['top', 'left', 'right', 'bottom']}>
            <ScreenHeader
                title={t('common.greeting')}
                subtitle={t('common.appName')}
                rightAction={
                    <View className="flex-row">
                        <HeaderAction
                            icon={<Globe size={20} color="#a1a1aa" />}
                            onPress={() => setLanguageModalVisible(true)}
                            variant="icon"
                        />
                        <HeaderAction
                            label={t('common.programs')}
                            onPress={() => navigation.navigate('Programs' as never)}
                            variant="secondary"
                        />
                    </View>
                }
            />

            {hasProgram ? (
                <>
                    {/* Status Card */}
                    <View className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <View>
                                <Text className="text-zinc-400 text-xs uppercase font-bold mb-1">{t('common.lastWorkout')}</Text>
                                <Text className="text-zinc-50 font-bold text-lg">{prevDay?.name}</Text>
                            </View>
                            <View className="bg-emerald-500/20 px-3 py-1 rounded-full">
                                <Text className="text-emerald-500 text-xs font-bold">{t('common.completed')}</Text>
                            </View>
                        </View>

                        <View className="h-[1px] bg-zinc-800 my-2" />

                        <View className="mt-2">
                            <Text className="text-zinc-400 text-xs uppercase font-bold mb-1">{t('common.today')}</Text>
                            <Text className="text-blue-500 font-bold text-2xl">{currentDay.name}</Text>
                            {currentDay.isRestDay ? (
                                <Text className="text-zinc-500 mt-2">{t('common.restDayMessage')}</Text>
                            ) : (
                                <Text className="text-zinc-500 mt-2">{t('common.exercisesCount', { count: currentDay.exercises.length })}</Text>
                            )}
                        </View>
                    </View>

                    {/* Quick Actions */}
                    {!currentDay.isRestDay && (
                        <TouchableOpacity
                            className="bg-blue-600 p-4 rounded-2xl items-center shadow-lg shadow-blue-500/20 active:bg-blue-500 mb-8"
                            onPress={handleStartWorkout}
                        >
                            <Text className="text-white font-bold text-lg">{t('common.startWorkout')}</Text>
                        </TouchableOpacity>
                    )}

                    {currentDay.isRestDay && (
                        <TouchableOpacity
                            className="bg-zinc-800 p-4 rounded-2xl items-center border border-zinc-700 active:bg-zinc-700 mb-8"
                            onPress={() => completeDay()}
                        >
                            <Text className="text-zinc-300 font-bold text-lg">{t('common.markComplete')}</Text>
                        </TouchableOpacity>
                    )}

                    {/* Upcoming Schedule Preview */}
                    <Text className="text-zinc-50 text-lg font-bold mb-4">{t('common.nextDays')}</Text>
                    <ScrollView className="flex-1">
                        {program.map((day, index) => {
                            // Simple logic to show next few days
                            if (index === currentDayIndex || index === prevDayIndex) return null;

                            return (
                                <View key={day.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-3 flex-row justify-between items-center">
                                    <Text className="text-zinc-300 font-medium">{day.name}</Text>
                                    <Text className="text-zinc-500 text-xs">{day.isRestDay ? t('common.rest') : `${day.exercises.length} ${t('common.exercises')}`}</Text>
                                </View>
                            );
                        })}
                    </ScrollView>
                </>
            ) : (
                <View className="flex-1 justify-center items-center pb-20">
                    <View className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 items-center w-full">
                        <View className="bg-zinc-800 p-4 rounded-full mb-4">
                            <Dumbbell size={32} color="#60a5fa" />
                        </View>
                        <Text className="text-zinc-50 text-xl font-bold mb-2 text-center">{t('common.noProgram')}</Text>
                        <Text className="text-zinc-400 text-center mb-8 leading-6">
                            Get started by creating a new workout program or selecting an existing one from your library.
                        </Text>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Programs' as never)}
                            className="bg-blue-600 w-full py-4 rounded-xl items-center shadow-lg shadow-blue-500/20 active:bg-blue-500"
                        >
                            <Text className="text-white font-bold text-lg">{t('common.programs')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <Modal visible={languageModalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/80 justify-end">
                    <View className="bg-zinc-900 rounded-t-3xl h-[70%] p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-zinc-50 text-xl font-bold">{t('common.selectLanguage')}</Text>
                            <TouchableOpacity onPress={() => setLanguageModalVisible(false)} className="p-2 bg-zinc-800 rounded-full">
                                <X size={20} color="#a1a1aa" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={LANGUAGES}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`p-4 rounded-xl mb-3 border ${i18n.language === item.code ? 'bg-blue-600 border-blue-500' : 'bg-zinc-800 border-zinc-700'}`}
                                    onPress={() => changeLanguage(item.code)}
                                >
                                    <Text className={`text-lg font-bold ${i18n.language === item.code ? 'text-white' : 'text-zinc-300'}`}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};
