import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { workoutService } from '../../src/services';
import { useLiveWorkoutStore } from '../../src/stores/useLiveWorkoutStore';
import { ExerciseCard } from '../../src/components/workout/ExerciseCard';
import { RestTimer } from '../../src/components/workout/RestTimer';
import { DayExerciseWithDetails, WorkoutSet } from '../../src/types/workout';

export default function LiveWorkoutScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const dayId = Number(id);
    const [isLoading, setIsLoading] = useState(true);
    const [dayName, setDayName] = useState('');
    const [exercises, setExercises] = useState<DayExerciseWithDetails[]>([]);
    const [sets, setSets] = useState<WorkoutSet[]>([]);

    const {
        workoutLogId,
        setWorkoutLogId,
        startRestTimer,
        stopRestTimer,
        isTimerRunning
    } = useLiveWorkoutStore();

    useEffect(() => {
        initializeSession();
    }, [dayId]);

    const initializeSession = async () => {
        try {
            setIsLoading(true);

            // 1. Get Day Details and Exercises via Service
            const { day, exercises: dayExercises } = await workoutService.getDayWithExercises(dayId);
            setDayName(day.name);
            setExercises(dayExercises);

            // 2. Initialize Workout Log
            const log = await workoutService.initializeWorkout(dayId, day.program_id);
            setWorkoutLogId(log.id);

            // 3. No existing sets (new workout)
            setSets([]);

            setIsLoading(false);
        } catch (error) {
            console.error("Failed to init workout", error);
            Alert.alert(t('common.error'), t('workout.init_failed'));
            router.back();
        }
    };

    const handleLogSet = async (exerciseId: number, dayExerciseId: number, setNumber: number, reps: number, weight: number) => {
        if (!workoutLogId) return;

        try {
            // Optimistic update? No, let's wait for DB.
            const newSet = await workoutService.logSet({
                workout_log_id: workoutLogId,
                exercise_id: exerciseId,
                day_exercise_id: dayExerciseId,
                set_number: setNumber,
                actual_reps: reps,
                actual_weight: weight,
                target_reps: 0, // Should get from dayExercise
                target_weight: weight, // Should get from dayExercise
                skipped: false
            });

            setSets(prev => [...prev, newSet]);

            // Start Rest Timer
            // Find rest time for this exercise
            const exercise = exercises.find(e => e.id === dayExerciseId);
            const restTime = exercise?.rest_time_seconds || 60;
            startRestTimer(restTime);

        } catch (error) {
            console.error("Failed to log set", error);
            Alert.alert(t('common.error'), t('workout.log_failed'));
        }
    };


    const handleFinishWorkout = async () => {
        if (!workoutLogId) return;

        try {
            await workoutService.completeWorkout(workoutLogId);
            Alert.alert(t('common.success'), t('workout.completed'), [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error("Failed to finish workout", error);
            Alert.alert(t('common.error'), t('workout.finish_failed'));
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-zinc-950 items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-zinc-950">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View
                style={{ paddingTop: insets.top }}
                className="bg-zinc-950 border-b border-zinc-900 px-6 pb-4 flex-row items-center justify-between"
            >
                <View>
                    <Text className="text-zinc-400 text-xs uppercase font-bold tracking-wider">{t('workout.live_session')}</Text>
                    <Text className="text-3xl font-bold text-white">{dayName}</Text>
                </View>
                <TouchableOpacity
                    onPress={handleFinishWorkout}
                    className="bg-blue-500 px-4 py-2 rounded-full"
                >
                    <Text className="text-white font-bold">{t('common.finish')}</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1 px-4 pt-6"
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {exercises.map((exercise, index) => (
                    <ExerciseCard
                        key={exercise.id}
                        exerciseName={exercise.name}
                        targetSets={exercise.target_sets}
                        targetReps={exercise.target_reps}
                        targetWeight={exercise.target_weight}
                        sets={sets.filter(s => s.day_exercise_id === exercise.id)}
                        onLogSet={(setNumber, reps, weight) => handleLogSet(exercise.exercise_id, exercise.id, setNumber, reps, weight)}
                    />
                ))}
            </ScrollView>

            {/* Rest Timer Overlay */}
            <RestTimer
                onAddSeconds={(s) => startRestTimer((useLiveWorkoutStore.getState().timerSecondsRemaining || 0) + s)}
                onSkip={stopRestTimer}
            />
        </View>
    );
}
