import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/80 justify-center items-center px-6">
                <View className="w-full max-w-sm bg-zinc-900 p-6 rounded-3xl border border-zinc-800 items-center shadow-2xl shadow-black">
                    <Text className="text-2xl font-bold text-zinc-50 mb-4">{t('skipExercise.title')}</Text>

                    <Text className="text-zinc-400 text-base text-center mb-8">
                        {t('skipExercise.message')}
                    </Text>

                    <View className="flex-row justify-between w-full space-x-4">
                        <TouchableOpacity
                            className="flex-1 py-4 rounded-2xl items-center active:bg-zinc-800"
                            onPress={onCancel}
                        >
                            <Text className="text-zinc-400 font-bold text-base">{t('common.cancel')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-[2] bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-blue-500/20 active:bg-blue-500"
                            onPress={onConfirm}
                        >
                            <Text className="text-white font-bold text-lg">{t('common.skip')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
