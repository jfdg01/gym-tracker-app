import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Dumbbell } from 'lucide-react-native';
import { getAllExercises, createExercise, updateExercise, deleteExercise, Exercise, NewExercise } from '../db/exercises';
import { ExerciseFormModal } from '../components/ExerciseFormModal';
import { useFocusEffect } from '@react-navigation/native';

export const ExercisesScreen = () => {
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
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            const filtered = exercises.filter(ex =>
                ex.name.toLowerCase().includes(lower) ||
                ex.muscle_group?.toLowerCase().includes(lower)
            );
            setFilteredExercises(filtered);
        } else {
            setFilteredExercises(exercises);
        }
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

    const renderItem = ({ item }: { item: Exercise }) => (
        <TouchableOpacity
            onPress={() => openEditModal(item)}
            className="bg-zinc-900 p-4 rounded-xl mb-3 border border-zinc-800 flex-row items-center"
        >
            <View className="bg-zinc-800 p-3 rounded-full mr-4">
                <Dumbbell size={24} color="#3b82f6" />
            </View>
            <View className="flex-1">
                <Text className="text-zinc-50 font-bold text-lg">{item.name}</Text>
                <Text className="text-zinc-400 text-sm">
                    {item.sets} sets • {item.min_reps}-{item.max_reps} reps • {item.weight ? `${item.weight}kg` : 'Peso libre'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-zinc-950">
            <View className="p-6 flex-1">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-zinc-50 text-3xl font-bold">Ejercicios</Text>
                    <TouchableOpacity
                        onPress={openCreateModal}
                        className="bg-blue-500 p-3 rounded-full"
                    >
                        <Plus size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="bg-zinc-900 p-3 rounded-xl flex-row items-center mb-6 border border-zinc-800">
                    <Search size={20} color="#71717a" className="mr-3" />
                    <TextInput
                        className="flex-1 text-zinc-50 text-base"
                        placeholder="Buscar ejercicios..."
                        placeholderTextColor="#71717a"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <FlatList
                    data={filteredExercises}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Text className="text-zinc-500 text-lg">No hay ejercicios aún.</Text>
                            <Text className="text-zinc-600 text-sm mt-2">Pulsa + para crear uno.</Text>
                        </View>
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
