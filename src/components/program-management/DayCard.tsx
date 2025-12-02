import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Switch, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DayItem, DayExerciseItem } from '../../types/program-management';
import { updateDay, removeExerciseFromDay, reorderExercisesInDay } from '../../db/plans';
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
    onEditExercise
}: DayCardProps) => {
    const { t } = useTranslation();
    const [dayName, setDayName] = useState(day.name);
    const [isRestDay, setIsRestDay] = useState(day.is_rest_day || false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isExerciseListCollapsed, setIsExerciseListCollapsed] = useState(false);

    const handleSaveDaySettings = async () => {
        await updateDay(day.id, { name: dayName, is_rest_day: isRestDay });
        onRefresh();
    };

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
            <View className="p-4 bg-zinc-800/50 border-b border-zinc-800">
                <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-1 flex-row items-center mr-2">
                        <TouchableOpacity
                            onPress={() => setIsCollapsed(!isCollapsed)}
                            className="mr-3 p-1 bg-zinc-800 rounded border border-zinc-700"
                        >
                            {isCollapsed ? (
                                <ChevronDown size={16} color="#a1a1aa" />
                            ) : (
                                <ChevronUp size={16} color="#a1a1aa" />
                            )}
                        </TouchableOpacity>
                        <TextInput
                            className="flex-1 text-zinc-50 font-bold text-lg bg-zinc-900/50 p-2 rounded border border-zinc-700"
                            value={dayName}
                            onChangeText={setDayName}
                            onEndEditing={handleSaveDaySettings}
                            placeholder={t('dayEditor.dayName')}
                            placeholderTextColor="#71717a"
                        />
                    </View>
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={onMoveUp}
                            disabled={isFirst}
                            className={`p-2 rounded mr-1 ${isFirst ? 'opacity-30' : 'bg-zinc-700'}`}
                        >
                            <ChevronUp size={16} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onMoveDown}
                            disabled={isLast}
                            className={`p-2 rounded mr-2 ${isLast ? 'opacity-30' : 'bg-zinc-700'}`}
                        >
                            <ChevronDown size={16} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onDelete} className="bg-red-900/30 p-2 rounded">
                            <Trash2 size={16} color="#f87171" />
                        </TouchableOpacity>
                    </View>
                </View>

                {!isCollapsed && (
                    <View className="flex-row items-center justify-between">
                        <Text className="text-zinc-400 text-sm">{t('common.restDay')}</Text>
                        <Switch
                            value={isRestDay}
                            onValueChange={async (val) => {
                                setIsRestDay(val);
                                await updateDay(day.id, { is_rest_day: val });
                                onRefresh();
                            }}
                            trackColor={{ false: '#3f3f46', true: '#2563eb' }}
                        />
                    </View>
                )}
            </View>

            {/* Content */}
            {!isCollapsed && (
                !isRestDay ? (
                    <View className="p-4">
                        <TouchableOpacity
                            className="flex-row items-center justify-between mb-2"
                            onPress={() => setIsExerciseListCollapsed(!isExerciseListCollapsed)}
                        >
                            <Text className="text-zinc-500 text-xs uppercase font-bold">{t('dayEditor.exercises')}</Text>
                            <View className="bg-zinc-900 p-1 rounded border border-zinc-800">
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
