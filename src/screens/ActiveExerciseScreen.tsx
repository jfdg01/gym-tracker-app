import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { X, Check } from 'lucide-react-native';
import { useLiveWorkout } from '../context/LiveWorkoutContext';
import { useProgram } from '../context/ProgramContext';
import { SetCompletionModal } from '../components/SetCompletionModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { HeaderAction } from '../components/HeaderAction';

export const ActiveExerciseScreen = () => {
    const { t } = useTranslation();
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
        finishWorkout,
    } = useLiveWorkout();

    const { completeDay } = useProgram();

    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [listModalVisible, setListModalVisible] = useState(false);
    const [skipModalVisible, setSkipModalVisible] = useState(false);

    useEffect(() => {
        if (workout?.completed) {
            navigation.navigate('WorkoutSummary' as never);
        }
    }, [workout?.completed]);

    if (!workout) return <View className="flex-1 bg-zinc-950 justify-center items-center"><Text className="text-zinc-50">{t('common.loading')}</Text></View>;

    const currentExercise = workout.exercises[currentExerciseIndex];
    const currentSet = currentExercise?.sets[currentSetIndex];

    if (!currentExercise) return <View className="flex-1 bg-zinc-950 justify-center items-center"><Text className="text-zinc-50">{t('activeExercise.noExercise')}</Text></View>;

    const handleCompleteSet = () => {
        setModalVisible(true);
    };

    const onConfirmSet = (reps: number) => {
        setModalVisible(false);
        completeSet(reps);
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top', 'left', 'right', 'bottom']}>
            {/* Header */}
            {/* Header */}
            <ScreenHeader
                title={currentExercise.name}
                subtitle={t('activeExercise.exerciseProgress', { current: currentExerciseIndex + 1, total: workout.exercises.length })}
                rightAction={
                    <HeaderAction
                        label={t('activeExercise.list')}
                        onPress={() => setListModalVisible(true)}
                        variant="secondary"
                    />
                }
            />

            {currentExercise.description && (
                <View className="px-6 py-2 bg-zinc-900/50 border-b border-zinc-900">
                    <Text className="text-zinc-400 text-sm italic">{currentExercise.description}</Text>
                </View>
            )}

            {/* Exercise List Modal */}
            <Modal visible={listModalVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-zinc-950">
                    {/* Modal Header */}
                    <View className="px-6 py-4 border-b border-zinc-900 flex-row justify-between items-center bg-zinc-950">
                        <Text className="text-zinc-50 text-xl font-bold">{t('activeExercise.sessionSummary')}</Text>
                        <TouchableOpacity
                            onPress={() => setListModalVisible(false)}
                            className="w-8 h-8 items-center justify-center bg-zinc-900 rounded-full"
                        >
                            <X size={20} color="#a1a1aa" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-6 pt-6">
                        {workout.exercises.map((ex, idx) => {
                            const isCurrent = idx === currentExerciseIndex;
                            const isCompleted = ex.sets.every(s => s.completed);
                            const completedSets = ex.sets.filter(s => s.completed).length;

                            return (
                                <TouchableOpacity
                                    key={`${ex.id}-${idx}`}
                                    onPress={() => {
                                        goToExercise(idx);
                                        setListModalVisible(false);
                                    }}
                                    className={`p-4 mb-3 rounded-2xl border flex-row justify-between items-center ${isCurrent
                                        ? 'bg-blue-900/10 border-blue-500'
                                        : isCompleted
                                            ? 'bg-zinc-900/50 border-zinc-900 opacity-60'
                                            : 'bg-zinc-900 border-zinc-800'
                                        }`}
                                >
                                    <View className="flex-1 mr-4">
                                        <View className="flex-row items-center mb-1">
                                            <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${isCurrent ? 'bg-blue-500' : isCompleted ? 'bg-emerald-500' : 'bg-zinc-800'
                                                }`}>
                                                <Text className="text-white text-xs font-bold">{idx + 1}</Text>
                                            </View>
                                            <Text className={`font-bold text-lg flex-1 ${isCurrent ? 'text-white' : isCompleted ? 'text-zinc-400' : 'text-zinc-300'
                                                }`}>
                                                {ex.name}
                                            </Text>
                                        </View>

                                        <View className="pl-9 flex-row items-center">
                                            <Text className="text-zinc-500 text-xs font-medium">
                                                {t('activeExercise.setsCount', { count: ex.sets.length })}
                                            </Text>
                                            {completedSets > 0 && (
                                                <>
                                                    <Text className="text-zinc-700 mx-2">•</Text>
                                                    <Text className={isCompleted ? 'text-emerald-500 text-xs' : 'text-zinc-500 text-xs'}>
                                                        {t('activeExercise.completedSets', { count: completedSets })}
                                                    </Text>
                                                </>
                                            )}
                                        </View>
                                    </View>

                                    {isCompleted && (
                                        <View className="bg-emerald-500/10 p-2 rounded-full">
                                            <Check size={16} color="#10b981" />
                                        </View>
                                    )}
                                    {isCurrent && (
                                        <View className="bg-blue-500/10 px-3 py-1 rounded-full">
                                            <Text className="text-blue-400 text-xs font-bold">{t('activeExercise.current')}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                        <View className="h-8" />
                    </ScrollView>

                    {/* Modal Footer */}
                    <View className="p-6 border-t border-zinc-900 bg-zinc-950 safe-bottom">
                        <TouchableOpacity
                            onPress={async () => {
                                setListModalVisible(false);
                                if (workout) {
                                    await completeDay(workout.exercises);
                                }
                                finishWorkout();
                            }}
                            className="w-full bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-blue-500/20 active:bg-blue-500"
                        >
                            <Text className="text-white font-bold text-lg">{t('activeExercise.finishWorkout')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ScrollView className="flex-1">
                {/* Sets List */}
                <View className="px-6 py-6">
                    {/* Header Row */}
                    <View className="flex-row mb-4 px-2">
                        <Text className="text-zinc-500 text-xs uppercase font-bold w-12 text-center">{t('activeExercise.setHeader')}</Text>
                        <Text className="text-zinc-500 text-xs uppercase font-bold flex-1 text-center">{t('activeExercise.targetHeader')}</Text>
                        <Text className="text-zinc-500 text-xs uppercase font-bold w-16 text-center">{t('activeExercise.doneHeader')}</Text>
                    </View>

                    {currentExercise.sets.map((set, index) => {
                        const isCurrentSet = index === currentSetIndex;
                        const isCompleted = set.completed;

                        return (
                            <View
                                key={`${set.id}-${index}`}
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
                                        {set.targetWeight}kg x {currentExercise.minReps}-{currentExercise.maxReps}
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
                <Text className="text-zinc-400 text-xs uppercase tracking-widest mb-1">{t('activeExercise.rest')}</Text>
                <Text className={`text-5xl font-bold tabular-nums ${isResting ? 'text-zinc-50' : 'text-zinc-700'}`}>
                    {isResting ? restTimer : currentExercise.restTimeSeconds}s
                </Text>
                <TouchableOpacity
                    onPress={cancelRest}
                    className="mt-2 py-2 px-4"
                    disabled={!isResting}
                    style={{ opacity: isResting ? 1 : 0 }}
                >
                    <Text className="text-zinc-500 text-sm font-medium">{t('activeExercise.skipRest')}</Text>
                </TouchableOpacity>
            </View>

            {/* Footer Actions */}
            <View className="px-6 py-6 pb-8 bg-zinc-950 border-t border-zinc-900">
                <View className="flex-row space-x-4">
                    <TouchableOpacity
                        onPress={() => setSkipModalVisible(true)}
                        className="flex-1 bg-zinc-900 py-4 rounded-2xl items-center border border-zinc-800 active:bg-zinc-800"
                    >
                        <Text className="text-zinc-400 font-bold text-lg">{t('activeExercise.skip')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="flex-[2] bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-blue-500/20 active:bg-blue-500"
                        disabled={isResting} // Re-added disabled prop based on original logic
                    >
                        <Text className={`font-bold text-lg ${isResting ? 'text-zinc-500' : 'text-white'}`}>
                            {isResting ? t('activeExercise.resting') : t('activeExercise.completeSet')}
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

            <ConfirmationModal
                visible={skipModalVisible}
                title={t('skipExercise.title')}
                message={t('skipExercise.message')}
                confirmText={t('common.skip')}
                cancelText={t('common.cancel')}
                onConfirm={() => {
                    skipExercise();
                    setSkipModalVisible(false);
                }}
                onCancel={() => setSkipModalVisible(false)}
            />
        </SafeAreaView>
    );
};
