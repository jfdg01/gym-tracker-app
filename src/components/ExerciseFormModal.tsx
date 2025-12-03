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
    const [trackType, setTrackType] = useState<'reps' | 'time'>('reps');
    const [resistanceType, setResistanceType] = useState<'weight' | 'text'>('weight');
    const [sets, setSets] = useState('3');
    const [maxReps, setMaxReps] = useState('12');
    const [weight, setWeight] = useState('');
    const [timeDuration, setTimeDuration] = useState('60');
    const [restTimeSeconds, setRestTimeSeconds] = useState('180');
    const [increaseRate, setIncreaseRate] = useState('2.5');
    const [timeIncreaseStep, setTimeIncreaseStep] = useState('5');
    const [maxTimeCap, setMaxTimeCap] = useState('120');
    const [currentValText, setCurrentValText] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');

            // Map DB type to UI state
            if (initialData.type === 'time') {
                setTrackType('time');
                setResistanceType('weight'); // Default
            } else if (initialData.type === 'text') {
                setTrackType('reps'); // Default
                setResistanceType('text');
            } else {
                setTrackType('reps');
                setResistanceType('weight');
            }

            setSets(initialData.sets?.toString() || '3');
            setMaxReps(initialData.max_reps?.toString() || '12');
            setWeight(initialData.weight?.toString() || '');
            setTimeDuration(initialData.time_duration?.toString() || '60');
            setRestTimeSeconds(initialData.rest_time_seconds?.toString() || '180');
            setIncreaseRate(initialData.increase_rate?.toString() || '2.5');
            setTimeIncreaseStep(initialData.time_increase_step?.toString() || '5');
            setMaxTimeCap(initialData.max_time_cap?.toString() || '120');
            setCurrentValText(initialData.current_val_text || '');
        } else {
            resetForm();
        }
    }, [initialData, visible]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setTrackType('reps');
        setResistanceType('weight');
        setSets('3');
        setMaxReps('12');
        setWeight('');
        setTimeDuration('60');
        setRestTimeSeconds('180');
        setIncreaseRate('2.5');
        setTimeIncreaseStep('5');
        setMaxTimeCap('120');
        setCurrentValText('');
    };

    const handleSave = async () => {
        if (!name.trim()) return;

        let type = 'reps';
        if (trackType === 'time') {
            type = 'time';
        } else if (resistanceType === 'text') {
            type = 'text';
        }

        const exerciseData: NewExercise = {
            name,
            description,
            type,
            sets: parseInt(sets) || 3,
            max_reps: parseInt(maxReps) || 12,
            weight: weight ? parseFloat(weight) : null,
            time_duration: parseInt(timeDuration) || 60,
            rest_time_seconds: parseInt(restTimeSeconds) || 180,
            increase_rate: parseFloat(increaseRate) || 2.5,
            time_increase_step: parseInt(timeIncreaseStep) || 5,
            max_time_cap: parseInt(maxTimeCap) || 120,
            current_val_text: currentValText,
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

                            {/* Tracking Type Selector */}
                            <Text className="text-zinc-400 mb-2 text-sm">{t('exerciseForm.trackTypeLabel')}</Text>
                            <View className="bg-zinc-800 rounded-full p-1 flex-row mb-4">
                                <TouchableOpacity
                                    onPress={() => setTrackType('reps')}
                                    className={`flex-1 py-3 rounded-full items-center ${trackType === 'reps' ? 'bg-blue-600' : 'bg-transparent'}`}
                                >
                                    <Text className={`font-bold ${trackType === 'reps' ? 'text-white' : 'text-zinc-400'}`}>{t('exerciseForm.typeReps')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setTrackType('time')}
                                    className={`flex-1 py-3 rounded-full items-center ${trackType === 'time' ? 'bg-blue-600' : 'bg-transparent'}`}
                                >
                                    <Text className={`font-bold ${trackType === 'time' ? 'text-white' : 'text-zinc-400'}`}>{t('exerciseForm.typeTime')}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Resistance Type Selector */}
                            <Text className="text-zinc-400 mb-2 text-sm">{t('exerciseForm.resistanceTypeLabel')}</Text>
                            <View className="bg-zinc-800 rounded-full p-1 flex-row mb-6">
                                <TouchableOpacity
                                    onPress={() => setResistanceType('weight')}
                                    className={`flex-1 py-3 rounded-full items-center ${resistanceType === 'weight' ? 'bg-blue-600' : 'bg-transparent'}`}
                                >
                                    <Text className={`font-bold ${resistanceType === 'weight' ? 'text-white' : 'text-zinc-400'}`}>{t('exerciseForm.resistanceWeight')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setResistanceType('text')}
                                    className={`flex-1 py-3 rounded-full items-center ${resistanceType === 'text' ? 'bg-blue-600' : 'bg-transparent'}`}
                                >
                                    <Text className={`font-bold ${resistanceType === 'text' ? 'text-white' : 'text-zinc-400'}`}>{t('exerciseForm.resistanceText')}</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row space-x-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-zinc-400 my-2 text-sm">{t('common.sets')}</Text>
                                    <NumberInput
                                        value={sets}
                                        onChange={setSets}
                                        step={1}
                                    />
                                </View>
                                {resistanceType === 'weight' && (
                                    <View className="flex-1 ml-2">
                                        <Text className="text-zinc-400 my-2 text-sm">{t('exerciseForm.weightLabel')}</Text>
                                        <NumberInput
                                            value={weight}
                                            onChange={setWeight}
                                            step={2.5}
                                            placeholder="0"
                                        />
                                    </View>
                                )}
                            </View>

                            {trackType === 'reps' && (
                                <View>
                                    <Text className="text-zinc-400 my-2 text-sm">{t('common.maxReps')}</Text>
                                    <NumberInput
                                        value={maxReps}
                                        onChange={setMaxReps}
                                        step={1}
                                    />
                                </View>
                            )}

                            {trackType === 'time' && (
                                <View>
                                    <Text className="text-zinc-400 my-2 text-sm">{t('exerciseForm.targetTime')}</Text>
                                    <NumberInput
                                        value={timeDuration}
                                        onChange={setTimeDuration}
                                        step={5}
                                    />
                                </View>
                            )}

                            <View>
                                <Text className="text-zinc-400 my-2 text-sm">{t('exerciseForm.restTimeLabel')}</Text>
                                <NumberInput
                                    value={restTimeSeconds}
                                    onChange={setRestTimeSeconds}
                                    step={5}
                                />
                            </View>

                            {resistanceType === 'weight' && (
                                <View className="flex-1">
                                    <Text className="text-zinc-400 my-2 text-sm">{t('exerciseForm.increaseRate')}</Text>
                                    <View className="flex-row items-center">
                                        <NumberInput
                                            value={increaseRate}
                                            onChange={setIncreaseRate}
                                            step={0.5}
                                            placeholder="2.5"
                                        />
                                    </View>
                                </View>
                            )}

                            {resistanceType === 'text' && (
                                <View>
                                    <Text className="text-zinc-400 my-2 text-sm">{t('exerciseForm.currentValText')}</Text>
                                    <TextInput
                                        className="bg-zinc-800 text-zinc-50 p-4 rounded-xl border border-zinc-800"
                                        placeholder={t('exerciseForm.currentValTextPlaceholder')}
                                        placeholderTextColor="#52525b"
                                        value={currentValText}
                                        onChangeText={setCurrentValText}
                                    />
                                </View>
                            )}

                            {trackType === 'time' && (
                                <View className="flex-row space-x-4">
                                    <View className="flex-1 mr-2">
                                        <Text className="text-zinc-400 my-2 text-sm">{t('exerciseForm.timeIncreaseStep')}</Text>
                                        <NumberInput
                                            value={timeIncreaseStep}
                                            onChange={setTimeIncreaseStep}
                                            step={5}
                                            placeholder="5"
                                        />
                                    </View>
                                    <View className="flex-1 ml-2">
                                        <Text className="text-zinc-400 my-2 text-sm">{t('exerciseForm.maxTimeCap')}</Text>
                                        <NumberInput
                                            value={maxTimeCap}
                                            onChange={setMaxTimeCap}
                                            step={5}
                                            placeholder="120"
                                        />
                                    </View>
                                </View>
                            )}
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
