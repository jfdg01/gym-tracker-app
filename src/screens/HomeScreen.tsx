import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgram } from '../context/ProgramContext';
import { useLiveWorkout } from '../context/LiveWorkoutContext';

export const HomeScreen = () => {
    const navigation = useNavigation();
    const { getCurrentDay, program, currentDayIndex, isLoading, completeDay } = useProgram();
    const { startWorkout } = useLiveWorkout();

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-zinc-950 px-6 justify-center items-center">
                <Text className="text-zinc-50">Loading program...</Text>
            </SafeAreaView>
        );
    }

    const currentDay = getCurrentDay();

    if (!currentDay || program.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-zinc-950 px-6 justify-center items-center">
                <Text className="text-zinc-50">No program found. Please restart the app to seed data.</Text>
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
            alert("It's a rest day! Enjoy your recovery.");
            return;
        }

        startWorkout(currentDay.exercises);
        navigation.navigate('ActiveExercise' as never);
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950 px-6">
            <View className="mt-8 mb-8 flex-row justify-between items-center">
                <View>
                    <Text className="text-zinc-400 text-sm uppercase tracking-wider font-bold mb-1">Gym Tracker</Text>
                    <Text className="text-3xl font-bold text-zinc-50">Hola, Usuario</Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ProgramSelection' as never)}
                    className="bg-zinc-800 p-2 rounded-lg border border-zinc-700"
                >
                    <Text className="text-zinc-400 font-bold text-xs">PROGRAMS</Text>
                </TouchableOpacity>
            </View>

            {/* Status Card */}
            <View className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-zinc-400 text-xs uppercase font-bold mb-1">Último Entrenamiento</Text>
                        <Text className="text-zinc-50 font-bold text-lg">{prevDay.name}</Text>
                    </View>
                    <View className="bg-emerald-500/20 px-3 py-1 rounded-full">
                        <Text className="text-emerald-500 text-xs font-bold">Completado</Text>
                    </View>
                </View>

                <View className="h-[1px] bg-zinc-800 my-2" />

                <View className="mt-2">
                    <Text className="text-zinc-400 text-xs uppercase font-bold mb-1">Te toca hoy</Text>
                    <Text className="text-blue-500 font-bold text-2xl">{currentDay.name}</Text>
                    {currentDay.isRestDay ? (
                        <Text className="text-zinc-500 mt-2">Día de recuperación activa. Estira, camina o simplemente descansa.</Text>
                    ) : (
                        <Text className="text-zinc-500 mt-2">{currentDay.exercises.length} ejercicios planificados</Text>
                    )}
                </View>
            </View>

            {/* Quick Actions */}
            {!currentDay.isRestDay && (
                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-2xl items-center shadow-lg shadow-blue-500/20 active:bg-blue-500 mb-8"
                    onPress={handleStartWorkout}
                >
                    <Text className="text-white font-bold text-lg">Comenzar Sesión</Text>
                </TouchableOpacity>
            )}

            {currentDay.isRestDay && (
                <TouchableOpacity
                    className="bg-zinc-800 p-4 rounded-2xl items-center border border-zinc-700 active:bg-zinc-700 mb-8"
                    onPress={() => completeDay()}
                >
                    <Text className="text-zinc-300 font-bold text-lg">Marcar como Completado</Text>
                </TouchableOpacity>
            )}

            {/* Upcoming Schedule Preview */}
            <Text className="text-zinc-50 text-lg font-bold mb-4">Próximos Días</Text>
            <ScrollView className="flex-1">
                {program.map((day, index) => {
                    // Simple logic to show next few days
                    if (index === currentDayIndex || index === prevDayIndex) return null;

                    return (
                        <View key={day.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-3 flex-row justify-between items-center">
                            <Text className="text-zinc-300 font-medium">{day.name}</Text>
                            <Text className="text-zinc-500 text-xs">{day.isRestDay ? 'Descanso' : `${day.exercises.length} Ejercicios`}</Text>
                        </View>
                    );
                })}
            </ScrollView>

        </SafeAreaView>
    );
};
