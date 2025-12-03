import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ConfirmationModal } from './ConfirmationModal';

interface SetCompletionModalProps {
    visible: boolean;
    onConfirm: (val: number) => void;
    onCancel: () => void;
    defaultReps?: number;
    type?: 'reps' | 'time';
}

// Global variable to store the last input across modal opens
let lastInputReps: number | null = null;

export const SetCompletionModal: React.FC<SetCompletionModalProps> = ({
    visible,
    onConfirm,
    onCancel,
    defaultReps = 0,
    type = 'reps',
}) => {
    const { t } = useTranslation();
    // Initialize with lastInputReps if available, otherwise defaultReps
    const [reps, setReps] = useState((lastInputReps ?? defaultReps).toString());

    useEffect(() => {
        if (visible) {
            setReps((lastInputReps ?? defaultReps).toString());
        }
    }, [defaultReps, visible, type]);

    const handleConfirm = () => {
        const repsNum = parseInt(reps, 10);
        if (!isNaN(repsNum)) {
            lastInputReps = repsNum; // Update the global last input
            onConfirm(repsNum);
        }
    };

    const increment = () => {
        const current = parseInt(reps, 10) || 0;
        setReps((current + 1).toString());
    };

    const decrement = () => {
        const current = parseInt(reps, 10) || 0;
        if (current > 0) {
            setReps((current - 1).toString());
        }
    };

    const getLabel = () => {
        switch (type) {
            case 'time': return t('setCompletion.timeLabel');
            default: return t('setCompletion.repsLabel');
        }
    };

    return (
        <ConfirmationModal
            visible={visible}
            title={t('setCompletion.title')}
            confirmText={t('common.save')}
            cancelText={t('common.cancel')}
            onConfirm={handleConfirm}
            onCancel={onCancel}
        >
            <Text className="text-zinc-400 text-sm uppercase tracking-wider font-bold mb-3 text-center">{getLabel()}</Text>

            {/* Unified Control Bar */}
            <View className="flex-row items-center mb-8 w-full bg-zinc-800 rounded-2xl p-1 border border-zinc-700">
                <TouchableOpacity
                    onPress={decrement}
                    className="w-16 h-16 items-center justify-center rounded-xl active:bg-zinc-700"
                >
                    <Text className="text-zinc-400 text-3xl font-light">-</Text>
                </TouchableOpacity>

                <TextInput
                    className="flex-1 text-zinc-50 text-center text-4xl font-bold py-2"
                    keyboardType="numeric"
                    value={reps}
                    onChangeText={setReps}
                    placeholder="0"
                    placeholderTextColor="#52525b"
                    selectTextOnFocus
                    selectionColor="#3b82f6"
                />

                <TouchableOpacity
                    onPress={increment}
                    className="w-16 h-16 items-center justify-center rounded-xl active:bg-zinc-700"
                >
                    <Text className="text-blue-500 text-3xl font-light">+</Text>
                </TouchableOpacity>
            </View>
        </ConfirmationModal>
    );
};
