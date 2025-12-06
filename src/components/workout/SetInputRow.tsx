import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SetInputRowProps } from '../../types/workout';

export const SetInputRow: React.FC<SetInputRowProps> = ({
    setNumber,
    targetReps,
    targetWeight,
    isCompleted,
    actualReps,
    onComplete,
    onUpdateReps
}) => {
    const { t } = useTranslation();

    return (
        <View className={`flex-row items-center justify-between p-4 mb-2 rounded-xl border ${isCompleted ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-zinc-900 border-zinc-800'}`}>
            {/* Set Number */}
            <View className="w-8 h-8 items-center justify-center rounded-full bg-zinc-800">
                <Text className="text-zinc-400 font-bold text-sm">{setNumber}</Text>
            </View>

            {/* Target Info */}
            <View className="flex-1 px-4">
                <Text className="text-zinc-500 text-xs uppercase font-bold">{t('workout.target')}</Text>
                <Text className="text-zinc-300 font-semibold">
                    {targetWeight}kg x {targetReps}
                </Text>
            </View>

            {/* Input & Action */}
            <View className="flex-row items-center space-x-4">
                <TextInput
                    className="w-16 h-12 bg-zinc-950 text-white text-center text-xl font-bold rounded-lg border border-zinc-800"
                    keyboardType="numeric"
                    value={actualReps?.toString() || ''}
                    placeholder={targetReps.toString()}
                    placeholderTextColor="#52525b"
                    onChangeText={(text) => onUpdateReps?.(parseInt(text) || 0)}
                    editable={!isCompleted}
                />

                <TouchableOpacity
                    onPress={() => onComplete(actualReps || targetReps)}
                    className={`w-12 h-12 items-center justify-center rounded-xl ${isCompleted ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                >
                    <Ionicons
                        name={isCompleted ? "checkmark" : "checkmark-outline"}
                        size={24}
                        color={isCompleted ? "white" : "#a1a1aa"}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};
