import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgram } from '../context/ProgramContext';
import { useLiveWorkout } from '../context/LiveWorkoutContext';
import { Globe, X } from 'lucide-react-native';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'zh', label: '中文' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'Français' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'pt', label: 'Português' },
    { code: 'ru', label: 'Русский' },
    { code: 'id', label: 'Bahasa Indonesia' },
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

    if (!currentDay || program.length === 0) {
        return (
            <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className="flex-1 bg-zinc-950 px-6 justify-center items-center">
                <Text className="text-zinc-50">{t('common.noProgram')}</Text>
            </SafeAreaView>
        );
    }

    // Calculate previous day index handling negative wrap-around
    const prevDayIndex = (currentDayIndex - 1 + program.length) % program.length;
    const prevDay = program[prevDayIndex];

    const handleStartWorkout = () => {
        if (currentDay.isRestDay) {
            // If it's a rest day, maybe just mark as complete or skip?
            // For now, let's just alert
            alert(t('home.restDayAlert'));
            return;
        }

        startWorkout(currentDay.exercises);
        navigation.navigate('ActiveExercise' as never);
    };

    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
        setLanguageModalVisible(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950 px-6" edges={['top', 'left', 'right', 'bottom']}>
            <View className="mt-8 mb-8 flex-row justify-between items-center">
                <View>
                    <Text className="text-zinc-400 text-sm uppercase tracking-wider font-bold mb-1">{t('common.appName')}</Text>
                    <Text className="text-3xl font-bold text-zinc-50">{t('common.greeting')}</Text>
                </View>
                <View className="flex-row space-x-2">
                    <TouchableOpacity
                        onPress={() => setLanguageModalVisible(true)}
                        className="bg-zinc-800 p-2 rounded-lg border border-zinc-700"
                    >
                        <Globe size={20} color="#a1a1aa" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Programs' as never)}
                        className="bg-zinc-800 p-2 rounded-lg border border-zinc-700"
                    >
                        <Text className="text-zinc-400 font-bold text-xs">{t('common.programs')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Status Card */}
            <View className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-zinc-400 text-xs uppercase font-bold mb-1">{t('common.lastWorkout')}</Text>
                        <Text className="text-zinc-50 font-bold text-lg">{prevDay.name}</Text>
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
