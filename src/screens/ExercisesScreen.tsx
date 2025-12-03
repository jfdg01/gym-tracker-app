import React, { useState, useEffect, useCallback } from 'react';

import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Dumbbell } from 'lucide-react-native';
import { getAllExercises, createExercise, updateExercise, deleteExercise, Exercise, NewExercise } from '../db/exercises';
import { ExerciseFormModal } from '../components/ExerciseFormModal';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenHeader } from '../components/ScreenHeader';
import { HeaderAction } from '../components/HeaderAction';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { searchFilter } from '../utils/textUtils';

export const ExercisesScreen = () => {
    const { t } = useTranslation();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

    const loadExercises = async () => {
        const data = await getAllExercises();
        setExercises(data);
        setFilteredExercises(data);
    };

    useFocusEffect(
        useCallback(() => {
            loadExercises();
        }, [])
    );

    useEffect(() => {
        setFilteredExercises(searchFilter(exercises, searchQuery));
    }, [searchQuery, exercises]);

    const handleSave = async (data: NewExercise) => {
        if (editingExercise) {
            await updateExercise(editingExercise.id, data);
        } else {
            await createExercise(data);
        }
        await loadExercises();
    };

    const handleDelete = async (id: number) => {
        await deleteExercise(id);
        await loadExercises();
    };

    const openCreateModal = () => {
        setEditingExercise(null);
        setIsModalVisible(true);
    };

    const openEditModal = (exercise: Exercise) => {
        setEditingExercise(exercise);
        setIsModalVisible(true);
    };

    const renderItem = ({ item }: { item: Exercise }) => {
        let details = '';
        const type = item.type || 'reps';
        const trackType = type === 'time' ? 'time' : 'reps';
        const resistanceType = type === 'text' ? 'text' : 'weight';

        if (trackType === 'time') {
            details = t('exercises.detailsTime', {
                sets: item.sets,
                duration: item.time_duration || 0
            });
        } else if (resistanceType === 'text') {
            details = t('exercises.detailsText', {
                sets: item.sets,
                value: item.current_val_text || t('common.none')
            });
        } else {
            details = t('exercises.exerciseDetails', {
                sets: item.sets,
                max: item.max_reps,
                weight: item.weight ? `${item.weight}kg` : t('exercises.freeWeight'),
                increaseRate: item.increase_rate,
            });
        }

        return (
            <TouchableOpacity
                onPress={() => openEditModal(item)}
                className="bg-zinc-900 p-4 rounded-xl mb-3 border border-zinc-800 flex-row items-center"
            >
                <View className="bg-zinc-800 p-3 rounded-full mr-4">
                    <Dumbbell size={24} color="#3b82f6" />
                </View>
                <View className="flex-1">
                    <Text className="text-zinc-50 font-bold text-lg">{item.name}</Text>
                    <Text className="text-zinc-400 text-sm">{details}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top', 'left', 'right', 'bottom']}>
            <View className="px-6 flex-1">
                {/* titulo Ejercicios */}
                <ScreenHeader
                    title={t('common.exercises')}
                    rightAction={
                        <HeaderAction
                            icon={<Plus size={20} color="white" />}
                            label={t('common.add')}
                            onPress={openCreateModal}
                            variant="primary"
                        />
                    }
                />

                {/* buscador */}
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />

                <FlatList
                    data={filteredExercises}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        exercises.length === 0 ? (
                            <EmptyState
                                icon={Dumbbell}
                                title={t('exercises.noExercises')}
                                message={t('exercises.createPrompt')}
                                actionLabel={t('common.add')}
                                onAction={openCreateModal}
                            />
                        ) : (
                            <View className="items-center justify-center py-20">
                                <Text className="text-zinc-500 text-lg">{t('tableList.noRecords')}</Text>
                            </View>
                        )
                    }
                    // add button
                    ListFooterComponent={
                        exercises.length > 0 ? (
                            <View className="items-center mt-4">
                                <TouchableOpacity
                                    onPress={openCreateModal}
                                    className="bg-blue-500 p-3 rounded-full"
                                >
                                    <Plus size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                />
            </View>

            <ExerciseFormModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSave={handleSave}
                onDelete={handleDelete}
                initialData={editingExercise}
            />
        </SafeAreaView>
    );
};
