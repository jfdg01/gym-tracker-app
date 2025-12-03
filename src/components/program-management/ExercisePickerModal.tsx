import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { db } from '../../db/client';
import { exercises } from '../../db/schema';
import { Plus } from 'lucide-react-native';
import { SearchBar } from '../SearchBar';
import { searchFilter } from '../../utils/textUtils';

type ExercisePickerModalProps = {
    visible: boolean;
    onClose: () => void;
    onSelect: (exerciseId: number) => void;
    onCreateExercise: () => void;
};

export const ExercisePickerModal = ({
    visible,
    onClose,
    onSelect,
    onCreateExercise
}: ExercisePickerModalProps) => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [allExercises, setAllExercises] = useState<typeof exercises.$inferSelect[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<typeof exercises.$inferSelect[]>([]);

    useEffect(() => {
        if (visible) {
            loadAllExercises();
        }
    }, [visible]);

    useEffect(() => {
        setFilteredExercises(searchFilter(allExercises, search));
    }, [search, allExercises]);

    const loadAllExercises = async () => {
        const results = await db.select().from(exercises);
        setAllExercises(results);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-zinc-950">
                <View className="px-4 py-4 border-b border-zinc-900 flex-row items-center justify-between">
                    <Text className="text-zinc-50 text-xl font-bold">{t('dayEditor.selectExercise')}</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text className="text-blue-500 text-lg font-bold">{t('common.close')}</Text>
                    </TouchableOpacity>
                </View>

                <View className="p-4">
                    <SearchBar
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <FlatList
                    data={filteredExercises}
                    keyExtractor={(item) => `exercise-${item.id}`}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-10">
                            <Text className="text-zinc-500 mb-4">{t('exercises.noExercisesFound')}</Text>
                            <TouchableOpacity
                                className="bg-blue-600 px-6 py-3 rounded-xl flex-row items-center"
                                onPress={onCreateExercise}
                            >
                                <Plus size={20} color="white" className="mr-2" />
                                <Text className="text-white font-bold">{t('exercises.createNew')}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="px-6 py-4 border-b border-zinc-900 active:bg-zinc-900"
                            onPress={() => onSelect(item.id)}
                        >
                            <Text className="text-zinc-50 font-bold text-lg">{item.name}</Text>
                            {item.description && (
                                <Text className="text-zinc-500 text-sm" numberOfLines={1}>{item.description}</Text>
                            )}
                        </TouchableOpacity>
                    )}
                    ListFooterComponent={
                        allExercises.length > 0 ? (
                            <View className="p-4">
                                <TouchableOpacity
                                    className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex-row items-center justify-center"
                                    onPress={onCreateExercise}
                                >
                                    <Plus size={20} color="#3b82f6" className="mr-2" />
                                    <Text className="text-blue-500 font-bold">{t('exercises.createNew')}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                />
            </View>
        </Modal>
    );
};
