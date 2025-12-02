import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLiveWorkout } from '../context/LiveWorkoutContext';
import { SetCompletionModal } from '../components/SetCompletionModal';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ActiveExerciseScreen = () => {
    const {
        workout,
        currentExerciseIndex,
        currentSetIndex,
        isResting,
        restTimer,
        startWorkout,
        completeSet,
        skipExercise,
        cancelRest,
    } = useLiveWorkout();

    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (!workout) {
            startWorkout();
        }
    }, [workout]);

    useEffect(() => {
        if (workout?.completed) {
            navigation.navigate('WorkoutSummary' as never);
        }
    }, [workout?.completed]);

    if (!workout) return <View className="flex-1 bg-zinc-950 justify-center items-center"><Text className="text-zinc-50">Cargando...</Text></View>;

    const currentExercise = workout.exercises[currentExerciseIndex];
    const currentSet = currentExercise?.sets[currentSetIndex];

    if (!currentExercise) return <View className="flex-1 bg-zinc-950 justify-center items-center"><Text className="text-zinc-50">No hay ejercicio</Text></View>;

    const handleCompleteSet = () => {
        setModalVisible(true);
    };

    const onConfirmSet = (reps: number) => {
        setModalVisible(false);
        completeSet(reps);
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950">
            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-zinc-900">
                <View>
                    <Text className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Ejercicio {currentExerciseIndex + 1} de {workout.exercises.length}</Text>
                    <Text className="text-2xl font-bold text-zinc-50 mt-1">{currentExercise.name}</Text>
                </View>
                <TouchableOpacity className="w-10 h-10 bg-zinc-900 rounded-full items-center justify-center border border-zinc-800" onPress={() => alert('Edit feature coming soon!')}>
                    <Text className="text-blue-500 font-bold text-xs">...</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content - Sets */}
            <ScrollView className="flex-1 px-6 pt-6">
                <View className="flex-row justify-between mb-4 px-2">
                    <Text className="text-zinc-500 text-xs uppercase font-bold w-12 text-center">Set</Text>
                    <Text className="text-zinc-500 text-xs uppercase font-bold flex-1 text-center">Objetivo</Text>
                    <Text className="text-zinc-500 text-xs uppercase font-bold w-20 text-center">Hecho</Text>
                </View>

                {currentExercise.sets.map((set, index) => {
                    const isActive = index === currentSetIndex;
                    const isCompleted = set.completed;

                    return (
                        <View
                            key={set.id}
                            className={`flex-row justify-between items-center py-4 px-2 mb-3 rounded-xl border ${isActive && !isResting
                                ? 'bg-zinc-900 border-blue-500/50'
                                : 'border-transparent'
                                } ${isCompleted ? 'opacity-50' : ''}`}
                        >
                            <View className={`w-12 h-8 rounded-lg justify-center items-center ${isCompleted ? 'bg-emerald-500/20' : isActive && !isResting ? 'bg-blue-500' : 'bg-zinc-800'}`}>
                                <Text className={`${isCompleted ? 'text-emerald-500' : isActive && !isResting ? 'text-white' : 'text-zinc-400'} font-bold`}>
                                    {index + 1}
                                </Text>
                            </View>

                            <Text className={`text-lg font-medium flex-1 text-center ${isActive && !isResting ? 'text-zinc-50' : 'text-zinc-400'}`}>
                                {set.targetWeight}kg x {set.targetReps}
                            </Text>

                            <View className="w-20 items-center">
                                {isCompleted ? (
                                    <Text className="text-emerald-500 font-bold text-lg">{set.actualReps}</Text>
                                ) : (
                                    <Text className="text-zinc-700 text-lg">-</Text>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Rest Timer Area */}
            <View className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-800 items-center">
                <Text className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Descanso</Text>
                <Text className={`text-5xl font-bold tabular-nums ${isResting ? 'text-zinc-50' : 'text-zinc-700'}`}>
                    {isResting ? restTimer : currentExercise.restTimeSeconds}s
                </Text>
                <TouchableOpacity
                    onPress={cancelRest}
                    className="mt-2 py-2 px-4"
                    disabled={!isResting}
                    style={{ opacity: isResting ? 1 : 0 }}
                >
                    <Text className="text-zinc-500 text-sm font-medium">Saltar descanso</Text>
                </TouchableOpacity>
            </View>

            {/* Footer Actions */}
            <View className="px-6 py-6 pb-8 bg-zinc-950 border-t border-zinc-900">
                <View className="flex-row space-x-4">
                    {/* Skip Button */}
                    <TouchableOpacity
                        className="flex-1 bg-zinc-900 py-4 rounded-2xl items-center justify-center border border-zinc-800 active:bg-zinc-800"
                        onPress={skipExercise}
                    >
                        <Text className="text-zinc-400 font-bold text-base">Saltar</Text>
                    </TouchableOpacity>

                    {/* Complete Button */}
                    <TouchableOpacity
                        className={`flex-[2] py-4 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/20 ${isResting ? 'bg-zinc-800' : 'bg-blue-600 active:bg-blue-500'
                            }`}
                        onPress={handleCompleteSet}
                        disabled={isResting}
                    >
                        <Text className={`font-bold text-lg ${isResting ? 'text-zinc-500' : 'text-white'}`}>
                            {isResting ? 'Descansando...' : 'He completado mi set'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <SetCompletionModal
                visible={modalVisible}
                onConfirm={onConfirmSet}
                onCancel={() => setModalVisible(false)}
                defaultReps={currentSet?.targetReps || 0}
            />
        </SafeAreaView>
    );
};
