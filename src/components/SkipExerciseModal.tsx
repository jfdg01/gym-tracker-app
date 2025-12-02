import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

interface SkipExerciseModalProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const SkipExerciseModal: React.FC<SkipExerciseModalProps> = ({
    visible,
    onConfirm,
    onCancel,
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/80 justify-center items-center px-6">
                <View className="w-full max-w-sm bg-zinc-900 p-6 rounded-3xl border border-zinc-800 items-center shadow-2xl shadow-black">
                    <Text className="text-2xl font-bold text-zinc-50 mb-4">Saltar Ejercicio</Text>

                    <Text className="text-zinc-400 text-base text-center mb-8">
                        ¿Estás seguro de que quieres saltar este ejercicio? No se guardará el progreso actual.
                    </Text>

                    <View className="flex-row justify-between w-full space-x-4">
                        <TouchableOpacity
                            className="flex-1 py-4 rounded-2xl items-center active:bg-zinc-800"
                            onPress={onCancel}
                        >
                            <Text className="text-zinc-400 font-bold text-base">Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-[2] bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-blue-500/20 active:bg-blue-500"
                            onPress={onConfirm}
                        >
                            <Text className="text-white font-bold text-lg">Saltar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
