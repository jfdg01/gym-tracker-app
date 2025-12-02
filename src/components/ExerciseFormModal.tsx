import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NewExercise, Exercise } from '../db/exercises';
import { X } from 'lucide-react-native';

interface ExerciseFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: NewExercise) => Promise<void>;
    onDelete?: (id: number) => Promise<void>;
    initialData?: Exercise | null;
}

export const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({ visible, onClose, onSave, onDelete, initialData }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [sets, setSets] = useState('3');
    const [minReps, setMinReps] = useState('4');
    const [maxReps, setMaxReps] = useState('12');
    const [weight, setWeight] = useState('');
    const [restTimeSeconds, setRestTimeSeconds] = useState('60');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setSets(initialData.sets?.toString() || '3');
            setMinReps(initialData.min_reps?.toString() || '4');
            setMaxReps(initialData.max_reps?.toString() || '12');
            setWeight(initialData.weight?.toString() || '');
            setRestTimeSeconds(initialData.rest_time_seconds?.toString() || '60');
        } else {
            resetForm();
        }
    }, [initialData, visible]);

    const resetForm = () => {
        setName('');
        setSets('3');
        setMinReps('4');
        setMaxReps('12');
        setWeight('');
        setRestTimeSeconds('60');
    };

    const handleSave = async () => {
        if (!name.trim()) return;

        const exerciseData: NewExercise = {
            name,
            sets: parseInt(sets) || 3,
            min_reps: parseInt(minReps) || 4,
            max_reps: parseInt(maxReps) || 12,
            weight: weight ? parseFloat(weight) : null,
            rest_time_seconds: parseInt(restTimeSeconds) || 60,
        };

        await onSave(exerciseData);
        onClose();
        resetForm();
    };

    const handleDelete = async () => {
        if (initialData && onDelete) {
            await onDelete(initialData.id);
            onClose();
            resetForm();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/80 justify-end">
                <View className="bg-zinc-900 rounded-t-3xl h-[90%] p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-zinc-50 text-xl font-bold">
                            {initialData ? t('exerciseForm.editTitle') : t('exerciseForm.newTitle')}
                        </Text>
                        <TouchableOpacity onPress={onClose} className="p-2 bg-zinc-800 rounded-full">
                            <X size={20} color="#a1a1aa" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        <View className="space-y-6 pb-10">
                            <View>
                                <Text className="text-zinc-400 mb-2 text-sm">{t('exerciseForm.nameLabel')}</Text>
                                <TextInput
                                    className="bg-zinc-800 text-zinc-50 p-4 rounded-xl border border-zinc-800"
                                    placeholder={t('exerciseForm.namePlaceholder')}
                                    placeholderTextColor="#52525b"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View className="h-px bg-zinc-800 my-4" />
                            <Text className="text-zinc-50 font-semibold text-lg">{t('exerciseForm.configuration')}</Text>

                            <View className="flex-row space-x-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-zinc-400 my-2 text-sm">{t('common.sets')}</Text>
                                    <TextInput
                                        className="bg-zinc-800 text-zinc-50 p-4 rounded-xl border border-zinc-800"
                                        value={sets}
                                        onChangeText={setSets}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View className="flex-1 ml-2">
                                    <Text className="text-zinc-400 my-2 text-sm">{t('exerciseForm.weightLabel')}</Text>
                                    <TextInput
                                        className="bg-zinc-800 text-zinc-50 p-4 rounded-xl border border-zinc-800"
                                        placeholder="0"
                                        placeholderTextColor="#52525b"
                                        value={weight}
                                        onChangeText={setWeight}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View className="flex-row space-x-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-zinc-400 my-2 text-sm">{t('common.minReps')}</Text>
                                    <TextInput
                                        className="bg-zinc-800 text-zinc-50 p-4 rounded-xl border border-zinc-800"
                                        value={minReps}
                                        onChangeText={setMinReps}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View className="flex-1 ml-2">
                                    <Text className="text-zinc-400 my-2 text-sm">{t('common.maxReps')}</Text>
                                    <TextInput
                                        className="bg-zinc-800 text-zinc-50 p-4 rounded-xl border border-zinc-800"
                                        value={maxReps}
                                        onChangeText={setMaxReps}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-zinc-400 my-2 text-sm">{t('exerciseForm.restTimeLabel')}</Text>
                                <TextInput
                                    className="bg-zinc-800 text-zinc-50 p-4 rounded-xl border border-zinc-800"
                                    value={restTimeSeconds}
                                    onChangeText={setRestTimeSeconds}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <View className="pt-4 border-t border-zinc-80 px-10">
                        <TouchableOpacity
                            onPress={handleSave}
                            className="bg-blue-500 p-4 rounded-xl items-center mb-4"
                        >
                            <Text className="text-white font-bold text-lg">{t('exerciseForm.save')}</Text>
                        </TouchableOpacity>

                        {initialData && (
                            <TouchableOpacity
                                onPress={handleDelete}
                                className="bg-red-500/10 p-4 rounded-xl items-center border border-red-500/20"
                            >
                                <Text className="text-red-500 font-bold text-lg">{t('exerciseForm.delete')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};
