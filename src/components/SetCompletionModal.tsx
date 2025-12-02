import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface SetCompletionModalProps {
    visible: boolean;
    onConfirm: (reps: number) => void;
    onCancel: () => void;
    defaultReps?: number;
}

// Global variable to store the last input across modal opens
let lastInputReps: number | null = null;

export const SetCompletionModal: React.FC<SetCompletionModalProps> = ({
    visible,
    onConfirm,
    onCancel,
    defaultReps = 0,
}) => {
    const { t } = useTranslation();
    // Initialize with lastInputReps if available, otherwise defaultReps
    const [reps, setReps] = useState((lastInputReps ?? defaultReps).toString());

    useEffect(() => {
        if (visible) {
            setReps((lastInputReps ?? defaultReps).toString());
        }
    }, [defaultReps, visible]);

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

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/80 justify-center items-center px-6">
                <View className="w-full max-w-sm bg-zinc-900 p-6 rounded-3xl border border-zinc-800 items-center shadow-2xl shadow-black">
                    <Text className="text-2xl font-bold text-zinc-50 mb-8">{t('setCompletion.title')}</Text>

                    <Text className="text-zinc-400 text-sm uppercase tracking-wider font-bold mb-3">{t('setCompletion.repsLabel')}</Text>

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

                    <View className="flex-row justify-between w-full space-x-4">
                        <TouchableOpacity
                            className="flex-1 py-4 rounded-2xl items-center active:bg-zinc-800"
                            onPress={onCancel}
                        >
                            <Text className="text-zinc-400 font-bold text-base">{t('common.cancel')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-[2] bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-blue-500/20 active:bg-blue-500"
                            onPress={handleConfirm}
                        >
                            <Text className="text-white font-bold text-lg">{t('common.save')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
