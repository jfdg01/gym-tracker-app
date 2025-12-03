import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgram } from '../context/ProgramContext';
import { useLiveWorkout } from '../context/LiveWorkoutContext';
import { Dumbbell } from 'lucide-react-native';
import { ScreenHeader } from '../components/ScreenHeader';

import { EmptyState } from '../components/EmptyState';
import { db } from '../db/client';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';



export const HomeScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [userName, setUserName] = useState('User');
    const { getCurrentDay, program, currentDayIndex, isLoading, completeDay, refreshProgram } = useProgram();

    useFocusEffect(
        useCallback(() => {
            refreshProgram();
            loadUserName();
        }, [refreshProgram])
    );

    const loadUserName = async () => {
        try {
            const settings = await db.select().from(schema.user_settings).limit(1);
            if (settings.length > 0 && settings[0].name) {
                setUserName(settings[0].name);
            }
        } catch (error) {
            console.error('Failed to load user name', error);
        }
    };
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



    return (
        <SafeAreaView className="flex-1 bg-zinc-950 px-6" edges={['top', 'left', 'right', 'bottom']}>
            <ScreenHeader
                title={t('common.greeting', { name: userName })}
                subtitle={t('common.appName')}
            />

            {
                hasProgram ? (
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
                    <EmptyState
                        icon={Dumbbell}
                        title={t('common.noProgram')}
                        message={t('home.noProgramMessage')}
                        actionLabel={t('common.programs')}
                        onAction={() => navigation.navigate('Programs' as never)}
                    />
                )
            }


        </SafeAreaView >
    );
};
