import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
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
                            {initialData ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
                        </Text>
                        <TouchableOpacity onPress={onClose} className="p-2 bg-zinc-800 rounded-full">
                            <X size={20} color="#a1a1aa" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        <View className="space-y-4 pb-10">
                            <View>
                                <Text className="text-zinc-400 mb-2 text-sm">Nombre *</Text>
                                <TextInput
                                    className="bg-zinc-800 text-zinc-50 p-4 rounded-xl border border-zinc-700"
                                    placeholder="Ej. Press de Banca"
                                    placeholderTextColor="#52525b"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View className="h-px bg-zinc-800 my-2" />
                            <Text className="text-zinc-50 font-semibold text-lg">Configuración</Text>

                            <View className="flex-row space-x-4">
                                <View className="flex-1">
                                    <Text className="text-zinc-400 mb-2 text-sm">Sets</Text>
                                    <TextInput
                                        className="bg-zinc-800 text-zinc-50 p-4 rounded-xl border border-zinc-700"
                                        value={sets}
                                        onChangeText={setSets}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-zinc-400 mb-2 text-sm">Peso (kg)</Text>
                                    <TextInput
                                        className="bg-zinc-800 text-zinc-50 p-4 rounded-xl border border-zinc-700"
                                        placeholder="0"
                                        placeholderTextColor="#52525b"
                                        value={weight}
                                        onChangeText={setWeight}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View className="flex-row space-x-4">
                                <View className="flex-1">
                                    <Text className="text-zinc-400 mb-2 text-sm">Min Reps</Text>
                                    <TextInput
                                        className="bg-zinc-800 text-zinc-50 p-4 rounded-xl border border-zinc-700"
                                        value={minReps}
                                        onChangeText={setMinReps}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-zinc-400 mb-2 text-sm">Max Reps</Text>
                                    <TextInput
                                        className="bg-zinc-800 text-zinc-50 p-4 rounded-xl border border-zinc-700"
                                        value={maxReps}
                                        onChangeText={setMaxReps}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-zinc-400 mb-2 text-sm">Descanso (seg)</Text>
                                <TextInput
                                    className="bg-zinc-800 text-zinc-50 p-4 rounded-xl border border-zinc-700"
                                    value={restTimeSeconds}
                                    onChangeText={setRestTimeSeconds}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <View className="pt-4 border-t border-zinc-800 space-y-3">
                        <TouchableOpacity
                            onPress={handleSave}
                            className="bg-blue-500 p-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-lg">Guardar Ejercicio</Text>
                        </TouchableOpacity>

                        {initialData && (
                            <TouchableOpacity
                                onPress={handleDelete}
                                className="bg-red-500/10 p-4 rounded-xl items-center border border-red-500/20"
                            >
                                <Text className="text-red-500 font-bold text-lg">Eliminar Ejercicio</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};
