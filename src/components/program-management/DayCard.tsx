import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Switch, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DayItem, DayExerciseItem } from '../../types/program-management';
import { removeExerciseFromDay, reorderExercisesInDay } from '../../db/plans';
import { Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react-native';
import { DayExerciseCard } from './DayExerciseCard';

type DayCardProps = {
    day: DayItem;
    exercises: DayExerciseItem[];
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
    onAddExercise: () => void;
    onRefresh: () => void;
    onEditExercise: (exerciseId: number) => void;
    onUpdate: (updates: Partial<DayItem>) => void;
    onSave: (overrides?: Partial<DayItem>) => void;
};

export const DayCard = ({
    day,
    exercises,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
    onAddExercise,
    onRefresh,
    onEditExercise,
    onUpdate,
    onSave
}: DayCardProps) => {
    const { t } = useTranslation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isExerciseListCollapsed, setIsExerciseListCollapsed] = useState(false);

    const handleRemoveExercise = async (id: number) => {
        await removeExerciseFromDay(id);
        onRefresh();
    };

    const handleMoveExercise = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === exercises.length - 1) return;

        const newOrder = [...exercises];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];

        const ids = newOrder.map(e => e.id);
        await reorderExercisesInDay(day.id, ids);
        onRefresh();
    };

    return (
        <View className="bg-zinc-900 rounded-xl border border-zinc-800 mb-4 overflow-hidden">
            {/* Header */}
            <View className="p-4 border-b border-zinc-800">
                <View className="mb-3">
                    <View className="flex-row justify-between items-start mb-3">
                        <TouchableOpacity
                            onPress={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 bg-zinc-800 rounded-lg border border-zinc-700 items-center justify-center min-w-[44px] min-h-[44px]"
                        >
                            {isCollapsed ? (
                                <>
                                    <ChevronDown size={20} color="#a1a1aa" />
                                    <Text className="text-zinc-400 text-[10px] mt-1">{t('common.expand')}</Text>
                                </>
                            ) : (
                                <>
                                    <ChevronUp size={20} color="#a1a1aa" />
                                    <Text className="text-zinc-400 text-[10px] mt-1">{t('common.collapse')}</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row items-center">
                            <TouchableOpacity
                                onPress={onMoveUp}
                                disabled={isFirst}
                                className={`p-2 rounded-lg mr-1 min-w-[44px] min-h-[44px] items-center justify-center flex-col ${isFirst ? 'opacity-30' : 'bg-zinc-700'}`}
                            >
                                <ChevronUp size={20} color="white" />
                                <Text className="text-white text-[10px] mt-1">{t('common.up')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onMoveDown}
                                disabled={isLast}
                                className={`p-2 rounded-lg mr-2 min-w-[44px] min-h-[44px] items-center justify-center flex-col ${isLast ? 'opacity-30' : 'bg-zinc-700'}`}
                            >
                                <ChevronDown size={20} color="white" />
                                <Text className="text-white text-[10px] mt-1">{t('common.down')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onDelete}
                                className="bg-red-900/30 p-2 rounded-lg min-w-[44px] min-h-[44px] items-center justify-center flex-col"
                            >
                                <Trash2 size={20} color="#f87171" />
                                <Text className="text-red-400 text-[10px] mt-1">{t('common.delete')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TextInput
                        className="text-zinc-50 font-bold text-lg bg-zinc-950 p-3 rounded-lg border border-zinc-800 w-full"
                        value={day.name}
                        onChangeText={(text) => onUpdate({ name: text })}
                        onEndEditing={() => onSave({ name: day.name })}
                        placeholder={t('dayEditor.dayName')}
                        placeholderTextColor="#71717a"
                    />
                </View>

                {!isCollapsed && (
                    <View className="flex-row items-center justify-between">
                        <Text className="text-zinc-400 text-sm">{t('common.restDay')}</Text>
                        <Switch
                            value={day.is_rest_day || false}
                            onValueChange={(val) => {
                                onUpdate({ is_rest_day: val });
                                onSave({ is_rest_day: val });
                            }}
                            trackColor={{ false: '#3f3f46', true: '#2563eb' }}
                        />
                    </View>
                )}
            </View>

            {/* Content */}
            {!isCollapsed && (
                !day.is_rest_day ? (
                    <View className="p-4">
                        <TouchableOpacity
                            className="flex-row items-center justify-between mb-2"
                            onPress={() => setIsExerciseListCollapsed(!isExerciseListCollapsed)}
                        >
                            <Text className="text-zinc-500 text-xs uppercase font-bold">{t('dayEditor.exercises')}</Text>
                            <View className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800 flex-row items-center">
                                <Text className="text-zinc-500 text-[10px] mr-1 font-medium">
                                    {isExerciseListCollapsed ? t('common.expand') : t('common.collapse')}
                                </Text>
                                {isExerciseListCollapsed ? (
                                    <ChevronDown size={14} color="#71717a" />
                                ) : (
                                    <ChevronUp size={14} color="#71717a" />
                                )}
                            </View>
                        </TouchableOpacity>

                        {!isExerciseListCollapsed && (
                            <>
                                {exercises.map((item, index) => (
                                    <DayExerciseCard
                                        key={`ex-${item.id}`}
                                        exercise={item}
                                        index={index}
                                        totalExercises={exercises.length}
                                        onMoveUp={() => handleMoveExercise(index, 'up')}
                                        onMoveDown={() => handleMoveExercise(index, 'down')}
                                        onRemove={() => handleRemoveExercise(item.id)}
                                        onEdit={() => onEditExercise(item.exercise_id)}
                                    />
                                ))}

                                <TouchableOpacity
                                    className="flex-row items-center justify-center bg-blue-600/10 p-3 rounded-lg border border-blue-600/30 mt-2"
                                    onPress={onAddExercise}
                                >
                                    <Plus size={16} color="#3b82f6" className="mr-2" />
                                    <Text className="text-blue-500 font-bold">{t('dayEditor.addExercise')}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                ) : (
                    <View className="p-8 items-center">
                        <Text className="text-zinc-600 italic">{t('dayEditor.restDayDescription')}</Text>
                    </View>
                )
            )}
        </View>
    );
};
