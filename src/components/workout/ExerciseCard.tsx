import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SetInputRow } from './SetInputRow';
import { WorkoutSet, ExerciseCardProps } from '../../types/workout';

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
    exerciseName,
    targetSets,
    targetReps,
    targetWeight,
    sets,
    onLogSet
}) => {
    const { t } = useTranslation();

    // Generate rows based on targetSets
    const rows = [];
    for (let i = 1; i <= targetSets; i++) {
        const existingSet = sets.find(s => s.set_number === i);
        rows.push(
            <SetInputRow
                key={i}
                setNumber={i}
                targetReps={targetReps}
                targetWeight={targetWeight}
                isCompleted={!!existingSet}
                actualReps={existingSet?.actual_reps}
                onComplete={(reps) => onLogSet(i, reps, targetWeight)}
            />
        );
    }

    return (
        <View className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-4">
            {/* Header */}
            <View className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                <Text className="text-lg font-bold text-white">{exerciseName}</Text>
                <Text className="text-zinc-400 text-xs">
                    {targetSets} x {targetReps} @ {targetWeight}kg
                </Text>
            </View>

            {/* Sets */}
            <View className="p-2">
                {rows}
            </View>
        </View>
    );
};
