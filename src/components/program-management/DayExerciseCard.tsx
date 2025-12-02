import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DayExerciseItem } from '../../types/program-management';
import { Trash2, ChevronUp, ChevronDown, Pencil } from 'lucide-react-native';

type DayExerciseCardProps = {
    exercise: DayExerciseItem;
    index: number;
    totalExercises: number;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
    onEdit: () => void;
};

export const DayExerciseCard = ({
    exercise,
    index,
    totalExercises,
    onMoveUp,
    onMoveDown,
    onRemove,
    onEdit
}: DayExerciseCardProps) => {
    const { t } = useTranslation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <View className="bg-zinc-950 rounded-lg border border-zinc-800 mb-2 overflow-hidden">
            <TouchableOpacity
                className="p-3 flex-row items-center justify-between bg-zinc-950"
                onPress={() => setIsCollapsed(!isCollapsed)}
                activeOpacity={0.7}
            >
                <Text className="text-zinc-50 font-bold flex-1">{exercise.name}</Text>
                <View className="bg-zinc-900 p-1 rounded">
                    {isCollapsed ? (
                        <ChevronDown size={16} color="#a1a1aa" />
                    ) : (
                        <ChevronUp size={16} color="#a1a1aa" />
                    )}
                </View>
            </TouchableOpacity>

            {!isCollapsed && (
                <View className="p-3 pt-0 flex-row items-center justify-between border-t border-zinc-900 mt-1">
                    <View className="flex-1 pt-2">
                        <Text className="text-zinc-500 text-xs">{t('dayEditor.setsReps', { sets: exercise.sets, reps: exercise.reps })}</Text>
                    </View>
                    <View className="flex-row items-center pt-2">
                        <TouchableOpacity onPress={onEdit} className="p-2 mr-1">
                            <Pencil size={16} color="#3b82f6" />
                        </TouchableOpacity>
                        <View className="flex-col mr-2">
                            <TouchableOpacity
                                onPress={onMoveUp}
                                disabled={index === 0}
                                className={`p-1 ${index === 0 ? 'opacity-30' : ''}`}
                            >
                                <ChevronUp size={14} color="#a1a1aa" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onMoveDown}
                                disabled={index === totalExercises - 1}
                                className={`p-1 ${index === totalExercises - 1 ? 'opacity-30' : ''}`}
                            >
                                <ChevronDown size={14} color="#a1a1aa" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={onRemove} className="p-2">
                            <Trash2 size={16} color="#71717a" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};
