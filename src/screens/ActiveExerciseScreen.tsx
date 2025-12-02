import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
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
        completeSet,
        skipExercise,
        goToExercise,
        cancelRest,
    } = useLiveWorkout();

    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [listModalVisible, setListModalVisible] = useState(false);

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
            <View className="px-6 py-4 border-b border-zinc-900 flex-row justify-between items-center">
                <View>
                    <Text className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-1">
                        Ejercicio {currentExerciseIndex + 1} de {workout.exercises.length}
                    </Text>
                    <Text className="text-zinc-50 text-2xl font-bold">{currentExercise.name}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => setListModalVisible(true)}
                    className="p-2 bg-zinc-900 rounded-lg border border-zinc-800"
                >
                    <Text className="text-zinc-400 font-bold text-xs">LISTA</Text>
                </TouchableOpacity>
            </View>

            {/* Exercise List Modal */}
            <Modal visible={listModalVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-zinc-950">
                    <View className="px-6 py-4 border-b border-zinc-900 flex-row justify-between items-center">
                        <Text className="text-zinc-50 text-xl font-bold">Ejercicios</Text>
                        <TouchableOpacity onPress={() => setListModalVisible(false)} className="p-2">
                            <Text className="text-blue-500 font-bold">Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView className="flex-1 px-6 pt-4">
                        {workout.exercises.map((ex, idx) => {
                            const isCurrent = idx === currentExerciseIndex;
                            const isCompleted = ex.sets.every(s => s.completed);

                            return (
                                <TouchableOpacity
                                    key={ex.id}
                                    onPress={() => {
                                        goToExercise(idx);
                                        setListModalVisible(false);
                                    }}
                                    className={`p-4 mb-3 rounded-xl border flex-row justify-between items-center ${isCurrent ? 'bg-blue-900/20 border-blue-500' : 'bg-zinc-900 border-zinc-800'
                                        }`}
                                >
                                    <View>
                                        <Text className={`font-bold text-lg ${isCurrent ? 'text-blue-400' : 'text-zinc-50'}`}>
                                            {idx + 1}. {ex.name}
                                        </Text>
                                        <Text className="text-zinc-500 text-xs">
                                            {ex.sets.length} sets • {ex.sets.filter(s => s.completed).length} completados
                                        </Text>
                                    </View>
                                    {isCompleted && (
                                        <View className="bg-emerald-500/20 px-2 py-1 rounded">
                                            <Text className="text-emerald-500 text-xs font-bold">✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </Modal>

            <ScrollView className="flex-1">
                {/* Sets List */}
                <View className="px-6 py-6">
                    {/* Header Row */}
                    <View className="flex-row mb-4 px-2">
                        <Text className="text-zinc-500 text-xs uppercase font-bold w-12 text-center">Set</Text>
                        <Text className="text-zinc-500 text-xs uppercase font-bold flex-1 text-center">Objetivo</Text>
                        <Text className="text-zinc-500 text-xs uppercase font-bold w-16 text-center">Hecho</Text>
                    </View>

                    {currentExercise.sets.map((set, index) => {
                        const isCurrentSet = index === currentSetIndex;
                        const isCompleted = set.completed;

                        return (
                            <View
                                key={set.id}
                                className={`flex-row items-center py-4 mb-2 rounded-xl border ${isCurrentSet
                                    ? 'bg-blue-900/10 border-blue-500/50'
                                    : 'bg-zinc-900 border-zinc-800'
                                    }`}
                            >
                                <View className="w-12 items-center justify-center">
                                    <View className={`w-6 h-6 rounded-full items-center justify-center ${isCompleted ? 'bg-emerald-500' : isCurrentSet ? 'bg-blue-500' : 'bg-zinc-800'
                                        }`}>
                                        <Text className="text-white text-xs font-bold">{index + 1}</Text>
                                    </View>
                                </View>

                                <View className="flex-1 items-center">
                                    <Text className={`text-base font-medium ${isCurrentSet ? 'text-zinc-50' : 'text-zinc-400'}`}>
                                        {set.targetWeight}kg x {set.targetReps}
                                    </Text>
                                </View>

                                <View className="w-16 items-center">
                                    {isCompleted ? (
                                        <Text className="text-emerald-500 font-bold text-lg">{set.actualReps}</Text>
                                    ) : (
                                        <Text className="text-zinc-600 font-bold text-lg">-</Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
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
                    <TouchableOpacity
                        onPress={skipExercise}
                        className="flex-1 bg-zinc-900 py-4 rounded-2xl items-center border border-zinc-800 active:bg-zinc-800"
                    >
                        <Text className="text-zinc-400 font-bold text-lg">Saltar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="flex-[2] bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-blue-500/20 active:bg-blue-500"
                        disabled={isResting} // Re-added disabled prop based on original logic
                    >
                        <Text className={`font-bold text-lg ${isResting ? 'text-zinc-500' : 'text-white'}`}>
                            {isResting ? 'Descansando...' : 'He completado mi set'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <SetCompletionModal
                visible={modalVisible}
                onConfirm={(reps) => {
                    completeSet(reps);
                    setModalVisible(false);
                }}
                onCancel={() => setModalVisible(false)}
                defaultReps={currentExercise.sets[currentSetIndex]?.targetReps || 0}
            />
        </SafeAreaView>
    );
};
