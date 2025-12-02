import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';

interface SetCompletionModalProps {
    visible: boolean;
    onConfirm: (reps: number) => void;
    onCancel: () => void;
    defaultReps?: number;
}

export const SetCompletionModal: React.FC<SetCompletionModalProps> = ({
    visible,
    onConfirm,
    onCancel,
    defaultReps = 0,
}) => {
    const [reps, setReps] = useState(defaultReps.toString());

    useEffect(() => {
        setReps(defaultReps.toString());
    }, [defaultReps, visible]);

    const handleConfirm = () => {
        const repsNum = parseInt(reps, 10);
        if (!isNaN(repsNum)) {
            onConfirm(repsNum);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/80 justify-center items-center px-4">
                <View className="w-full max-w-sm bg-zinc-900 p-6 rounded-2xl border border-zinc-800 items-center">
                    <Text className="text-xl font-bold text-zinc-50 mb-6">Set Completed</Text>

                    <Text className="text-zinc-400 mb-2">Reps performed:</Text>
                    <TextInput
                        className="w-full bg-zinc-800 text-zinc-50 p-4 rounded-xl mb-6 text-center text-2xl font-bold border border-zinc-700"
                        keyboardType="numeric"
                        value={reps}
                        onChangeText={setReps}
                        placeholder="Reps"
                        placeholderTextColor="#52525b"
                        autoFocus
                    />

                    <View className="flex-row justify-between w-full space-x-4">
                        <TouchableOpacity
                            className="flex-1 bg-transparent border border-zinc-700 p-4 rounded-xl items-center"
                            onPress={onCancel}
                        >
                            <Text className="text-zinc-300 font-semibold">Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 bg-blue-500 p-4 rounded-xl items-center"
                            onPress={handleConfirm}
                        >
                            <Text className="text-white font-bold">Okay</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
