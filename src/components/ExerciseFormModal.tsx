import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NewExercise, Exercise } from '../db/exercises';
import { X, Minus, Plus } from 'lucide-react-native';
import { ConfirmationModal } from './ConfirmationModal';

interface ExerciseFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: NewExercise) => Promise<void>;
    onDelete?: (id: number) => Promise<void>;
    initialData?: Exercise | null;
}

interface NumberInputProps {
    value: string;
    onChange: (value: string) => void;
    step?: number;
    placeholder?: string;
    min?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, step = 1, placeholder, min = 0 }) => {
    const handleIncrement = () => {
        const current = parseFloat(value) || 0;
        const next = current + step;
        const formatted = Number.isInteger(step) ? next.toString() : next.toFixed(1);
        onChange(formatted);
    };

    const handleDecrement = () => {
        const current = parseFloat(value) || 0;
        const next = current - step;
        if (next < min) return;
        const formatted = Number.isInteger(step) ? next.toString() : next.toFixed(1);
        onChange(formatted);
    };

    return (
        <View className="flex-row items-center bg-zinc-800 rounded-xl border border-zinc-800">
            <TouchableOpacity onPress={handleDecrement} className="p-4 active:bg-zinc-700 rounded-l-xl">
                <Minus size={20} color="#a1a1aa" />
            </TouchableOpacity>
            <TextInput
                className="flex-1 text-zinc-50 text-center font-bold text-lg py-4"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                placeholder={placeholder}
                placeholderTextColor="#52525b"
            />
            <TouchableOpacity onPress={handleIncrement} className="p-4 active:bg-zinc-700 rounded-r-xl">
                <Plus size={20} color="#3b82f6" />
            </TouchableOpacity>
        </View>
    );
};

export const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({ visible, onClose, onSave, onDelete, initialData }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [sets, setSets] = useState('3');
    const [minReps, setMinReps] = useState('4');
    const [maxReps, setMaxReps] = useState('12');
    const [weight, setWeight] = useState('');
    const [restTimeSeconds, setRestTimeSeconds] = useState('180');
    const [increaseRate, setIncreaseRate] = useState('2.5');
    const [decreaseRate, setDecreaseRate] = useState('5.0');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setSets(initialData.sets?.toString() || '3');
            setMinReps(initialData.min_reps?.toString() || '4');
            setMaxReps(initialData.max_reps?.toString() || '12');
            setWeight(initialData.weight?.toString() || '');
            setRestTimeSeconds(initialData.rest_time_seconds?.toString() || '180');
            setIncreaseRate(initialData.increase_rate?.toString() || '2.5');
            setDecreaseRate(initialData.decrease_rate?.toString() || '5.0');
        } else {
            resetForm();
        }
    }, [initialData, visible]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setSets('3');
        setMinReps('4');
        setMaxReps('12');
        setWeight('');
        setRestTimeSeconds('180');
        setIncreaseRate('2.5');
        setDecreaseRate('5.0');
    };

    const handleSave = async () => {
        if (!name.trim()) return;

        const exerciseData: NewExercise = {
            name,
            description,
            sets: parseInt(sets) || 3,
            min_reps: parseInt(minReps) || 4,
            max_reps: parseInt(maxReps) || 12,
            weight: weight ? parseFloat(weight) : null,
            rest_time_seconds: parseInt(restTimeSeconds) || 180,
            increase_rate: parseFloat(increaseRate) || 2.5,
            decrease_rate: parseFloat(decreaseRate) || 5.0,
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

                            <View>
                                <Text className="text-zinc-400 my-3 text-sm">{t('exerciseForm.descriptionLabel')}</Text>
                                <TextInput
                                    className="bg-zinc-800 text-zinc-50 p-4 rounded-xl border border-zinc-800 min-h-[100px]"
                                    placeholder={t('exerciseForm.descriptionPlaceholder')}
                                    placeholderTextColor="#52525b"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    textAlignVertical="top"
                                />
                            </View>

                            <View className="h-px bg-zinc-800 my-4" />
                            <Text className="text-zinc-50 font-semibold text-lg">{t('exerciseForm.configuration')}</Text>

                            <View className="flex-row space-x-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-zinc-400 my-2 text-sm">{t('common.sets')}</Text>
                                    <NumberInput
                                        value={sets}
                                        onChange={setSets}
                                        step={1}
                                    />
                                </View>
                                <View className="flex-1 ml-2">
                                    <Text className="text-zinc-400 my-2 text-sm">{t('exerciseForm.weightLabel')}</Text>
                                    <NumberInput
                                        value={weight}
                                        onChange={setWeight}
                                        step={2.5}
                                        placeholder="0"
                                    />
                                </View>
                            </View>

                            <View className="flex-row space-x-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-zinc-400 my-2 text-sm">{t('common.minReps')}</Text>
                                    <NumberInput
                                        value={minReps}
                                        onChange={setMinReps}
                                        step={1}
                                    />
                                </View>
                                <View className="flex-1 ml-2">
                                    <Text className="text-zinc-400 my-2 text-sm">{t('common.maxReps')}</Text>
                                    <NumberInput
                                        value={maxReps}
                                        onChange={setMaxReps}
                                        step={1}
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-zinc-400 my-2 text-sm">{t('exerciseForm.restTimeLabel')}</Text>
                                <NumberInput
                                    value={restTimeSeconds}
                                    onChange={setRestTimeSeconds}
                                    step={5}
                                />
                            </View>

                            <View className="flex-row space-x-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-zinc-400 my-2 text-sm">{t('exerciseForm.increaseRate')}</Text>
                                    <NumberInput
                                        value={increaseRate}
                                        onChange={setIncreaseRate}
                                        step={0.5}
                                        placeholder="2.5"
                                    />
                                </View>
                                <View className="flex-1 ml-2">
                                    <Text className="text-zinc-400 my-2 text-sm">{t('exerciseForm.decreaseRate')}</Text>
                                    <NumberInput
                                        value={decreaseRate}
                                        onChange={setDecreaseRate}
                                        step={0.5}
                                        placeholder="5.0"
                                    />
                                </View>
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
                                onPress={() => setShowDeleteConfirm(true)}
                                className="bg-red-500/10 p-4 rounded-xl items-center border border-red-500/20"
                            >
                                <Text className="text-red-500 font-bold text-lg">{t('exerciseForm.delete')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            <ConfirmationModal
                visible={showDeleteConfirm}
                title={t('exerciseForm.deleteConfirmTitle')}
                message={t('exerciseForm.deleteConfirmMessage')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                confirmButtonColor="red"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </Modal>
    );
};
