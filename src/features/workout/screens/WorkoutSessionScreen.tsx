import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useWorkoutStore } from '../stores/useWorkoutStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkoutSessionScreen() {
    const params = useLocalSearchParams<{ programId: string; dayId: string }>();
    const {
        startWorkout,
        isLoading,
        exercises,
        isWorkoutActive,
        exercisesStatus,
        finishWorkout
    } = useWorkoutStore();

    useEffect(() => {
        if (params.programId && params.dayId) {
            startWorkout(parseInt(params.programId), parseInt(params.dayId));
        }
    }, [params.programId, params.dayId]);

    const handleFinish = async () => {
        await finishWorkout();
        router.replace('/');
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-zinc-950 items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-zinc-400 mt-4">Preparing your workout...</Text>
            </View>
        );
    }

    /* 
       Note: The actual logging UI (Set List) would be a sub-component. 
       For this Step, I'll render a simple list of exercises.
    */

    return (
        <SafeAreaView className="flex-1 bg-zinc-950">
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-zinc-900">
                <Text className="text-white text-xl font-bold">Active Session</Text>
                <TouchableOpacity onPress={handleFinish} className="bg-red-500/20 px-4 py-2 rounded-lg">
                    <Text className="text-red-500 font-bold">Finish</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-6">
                {exercises.map((exercise, index) => {
                    const isSkipped = exercisesStatus[exercise.id]?.skipped;
                    return (
                        <View key={exercise.id} className={`bg-zinc-900 p-4 rounded-xl mb-4 border ${isSkipped ? 'border-zinc-800 opacity-50' : 'border-zinc-800'}`}>
                            <View className="flex-row justify-between items-start mb-2">
                                <View>
                                    <Text className="text-white text-lg font-bold">{exercise.name}</Text>
                                    <Text className="text-zinc-400 text-sm">{exercise.sets} Sets • {exercise.tracking_type === 'reps' ? `${exercise.max_reps} Reps` : `${exercise.max_time}s`}</Text>
                                </View>
                                {isSkipped && <Text className="text-orange-500 text-xs font-bold uppercase">Skipped</Text>}
                            </View>

                            <Text className="text-zinc-500 text-sm mb-4">{exercise.description}</Text>

                            {/* Placeholder for Sets UI */}
                            <View className="bg-zinc-950 p-2 rounded-lg">
                                <Text className="text-zinc-600 text-center text-xs">Set Interaction will be here</Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}
