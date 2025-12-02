import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLiveWorkout } from '../context/LiveWorkoutContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgram } from '../context/ProgramContext';
import { ScreenHeader } from '../components/ScreenHeader';

export const WorkoutSummaryScreen = () => {
    const { t } = useTranslation();
    const { workout } = useLiveWorkout();
    const { completeDay } = useProgram();
    const navigation = useNavigation();

    if (!workout) return <View className="flex-1 bg-zinc-950 justify-center items-center"><Text className="text-zinc-50">{t('workoutSummary.noData')}</Text></View>;

    const handleFinish = () => {
        if (workout) {
            completeDay(workout.exercises);
        }
        (navigation as any).navigate('Tabs', { screen: 'Home' });
    };

    // Calculate total duration (mocked for now as we don't track start/end precisely in context yet)
    const duration = "45 min";
    const totalVolume = workout.exercises.reduce((acc, ex) => {
        return acc + ex.sets.reduce((sAcc, s) => sAcc + (s.completed ? (s.actualReps || 0) * s.targetWeight : 0), 0);
    }, 0);

    return (
        <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className="flex-1 bg-zinc-950">
            <ScrollView className="flex-1 px-6">
                <ScreenHeader
                    title={t('workoutSummary.summary')}
                    subtitle={t('workoutSummary.goodJob')}
                />

                {/* Stats Row */}
                <View className="flex-row justify-between mb-8 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                    <View className="items-center flex-1 border-r border-zinc-800">
                        <Text className="text-zinc-400 text-xs uppercase font-bold mb-1">{t('workoutSummary.time')}</Text>
                        <Text className="text-zinc-50 text-xl font-bold">{duration}</Text>
                    </View>
                    <View className="items-center flex-1">
                        <Text className="text-zinc-400 text-xs uppercase font-bold mb-1">{t('common.exercises')}</Text>
                        <Text className="text-zinc-50 text-xl font-bold">{workout.exercises.length}</Text>
                    </View>
                </View>

                <Text className="text-zinc-50 text-lg font-bold mb-4">{t('workoutSummary.exerciseDetails')}</Text>

                {workout.exercises.map((exercise) => (
                    <View key={exercise.id} className="bg-zinc-900 p-4 rounded-2xl mb-4 border border-zinc-800">
                        <View className="flex-row justify-between items-start mb-3">
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-zinc-50">{exercise.name}</Text>
                                <Text className="text-zinc-500 text-xs">{t('workoutSummary.setsCompleted', { count: exercise.sets.filter(s => s.completed).length })}</Text>
                            </View>

                            {exercise.nextSessionWeightAdjustment !== 0 && exercise.nextSessionWeightAdjustment !== undefined && (
                                <View className={`px-2 py-1 rounded-lg ${exercise.nextSessionWeightAdjustment > 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
                                    }`}>
                                    <Text className={`${exercise.nextSessionWeightAdjustment > 0 ? 'text-emerald-500' : 'text-red-500'
                                        } font-bold text-xs`}>
                                        {exercise.nextSessionWeightAdjustment > 0 ? t('workoutSummary.increaseWeight') : t('workoutSummary.decreaseWeight')}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Sets Summary Grid */}
                        <View className="flex-row flex-wrap gap-2">
                            {exercise.sets.map((set, index) => (
                                <View key={set.id} className={`items-center justify-center w-10 h-10 rounded-lg ${set.completed ? 'bg-zinc-800' : 'bg-zinc-900 border border-zinc-800'}`}>
                                    <Text className={`font-bold text-xs ${set.completed ? 'text-zinc-50' : 'text-zinc-600'}`}>
                                        {set.completed ? set.actualReps : '-'}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {exercise.nextSessionWeightAdjustment !== 0 && exercise.nextSessionWeightAdjustment !== undefined && (
                            <View className="mt-3 pt-3 border-t border-zinc-800 flex-row items-center">
                                <Text className="text-zinc-400 text-xs mr-2">{t('workoutSummary.nextSession')}</Text>
                                <Text className="text-zinc-50 font-bold text-sm">
                                    {exercise.sets[0].targetWeight + exercise.nextSessionWeightAdjustment}kg
                                    <Text className={exercise.nextSessionWeightAdjustment > 0 ? 'text-emerald-500' : 'text-red-500'}>
                                        {' '}({exercise.nextSessionWeightAdjustment > 0 ? '+' : ''}{exercise.nextSessionWeightAdjustment}kg)
                                    </Text>
                                </Text>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

            <View className="p-6 bg-zinc-950 border-t border-zinc-900">
                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-2xl items-center shadow-lg shadow-blue-500/20 active:bg-blue-500"
                    onPress={handleFinish}
                >
                    <Text className="text-white font-bold text-lg">{t('activeExercise.finishWorkout')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
