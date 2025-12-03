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
        <View className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 mb-2 overflow-hidden">
            <TouchableOpacity
                className="p-3 flex-row items-center justify-between"
                onPress={() => setIsCollapsed(!isCollapsed)}
                activeOpacity={0.7}
            >
                <Text className="text-zinc-50 font-bold flex-1">{exercise.name}</Text>
                <View className="bg-zinc-900 px-2 py-1 rounded items-center justify-center min-w-[30px] flex-row">
                    <Text className="text-zinc-500 text-[10px] mr-1 font-medium">
                        {isCollapsed ? t('common.expand') : t('common.collapse')}
                    </Text>
                    {isCollapsed ? (
                        <ChevronDown size={16} color="#a1a1aa" />
                    ) : (
                        <ChevronUp size={16} color="#a1a1aa" />
                    )}
                </View>
            </TouchableOpacity>

            {!isCollapsed && (
                <View className="p-3 pt-0 flex-row items-center justify-between border-t border-zinc-700/50 mt-1">
                    <View className="flex-1 pt-2">
                        <Text className="text-zinc-500 text-xs">{t('dayEditor.setsReps', { sets: exercise.sets, reps: exercise.reps })}</Text>
                    </View>
                    <View className="flex-row items-center pt-2">
                        <TouchableOpacity
                            onPress={onEdit}
                            className="p-2 mr-1 min-w-[44px] min-h-[44px] items-center justify-center"
                        >
                            <Pencil size={20} color="#3b82f6" />
                            <Text className="text-[10px] text-zinc-400 mt-1">{t('common.edit')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onMoveUp}
                            disabled={index === 0}
                            className={`p-2 mr-1 min-w-[44px] min-h-[44px] items-center justify-center ${index === 0 ? 'opacity-30' : ''}`}
                        >
                            <ChevronUp size={20} color="#a1a1aa" />
                            <Text className="text-[10px] text-zinc-400 mt-1">{t('common.up')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onMoveDown}
                            disabled={index === totalExercises - 1}
                            className={`p-2 mr-1 min-w-[44px] min-h-[44px] items-center justify-center ${index === totalExercises - 1 ? 'opacity-30' : ''}`}
                        >
                            <ChevronDown size={20} color="#a1a1aa" />
                            <Text className="text-[10px] text-zinc-400 mt-1">{t('common.down')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onRemove}
                            className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
                        >
                            <Trash2 size={20} color="#71717a" />
                            <Text className="text-[10px] text-zinc-400 mt-1">{t('common.delete')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};
