import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { programService, userService } from '../src/services';

export default function HomeScreen() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [programs, setPrograms] = useState<any[]>([]);
    const [days, setDays] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const allPrograms = await programService.getAllPrograms();
            setPrograms(allPrograms);

            if (allPrograms.length > 0) {
                const programDays = await programService.getDaysByProgramId(allPrograms[0].id);
                setDays(programDays);
            }
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'es' : 'en';
        i18n.changeLanguage(newLang);
    };

    const startWorkout = (dayId: number) => {
        router.push(`/workout/${dayId}`);
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-zinc-950">
            <View className="flex-1 px-6 pt-6">
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <Text className="text-zinc-400 text-xs uppercase font-bold tracking-wider">
                            {t('welcome.title')}
                        </Text>
                        <Text className="text-3xl font-bold text-white">Gym Tracker</Text>
                    </View>
                    <TouchableOpacity
                        onPress={toggleLanguage}
                        className="bg-zinc-800 px-4 py-2 rounded-full border border-zinc-700"
                    >
                        <Text className="text-white font-semibold">
                            {i18n.language.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1">
                    {programs.length === 0 ? (
                        <View className="flex-1 items-center justify-center mt-20">
                            <Text className="text-zinc-400 text-center mb-6">
                                No programs found. Create sample data to get started.
                            </Text>
                            <TouchableOpacity
                                onPress={async () => {
                                    const { createSampleWorkoutData } = await import('../src/utils/createSampleData');
                                    await createSampleWorkoutData();
                                    await loadData();
                                }}
                                className="bg-blue-500 px-6 py-3 rounded-full"
                            >
                                <Text className="text-white font-bold">Create Sample Data</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <Text className="text-xl font-bold text-white mb-4">
                                {programs[0]?.name || 'Program'}
                            </Text>
                            {days.map((day) => (
                                <TouchableOpacity
                                    key={day.id}
                                    onPress={() => startWorkout(day.id)}
                                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4"
                                >
                                    <Text className="text-lg font-bold text-white">{day.name}</Text>
                                    {day.is_rest_day ? (
                                        <Text className="text-zinc-400 text-sm mt-1">Rest Day</Text>
                                    ) : (
                                        <Text className="text-blue-500 text-sm mt-1">Start Workout →</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
