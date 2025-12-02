import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmButtonColor?: string; // 'blue' | 'red' | 'emerald' etc. (tailwind class prefix)
    children?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    visible,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    confirmButtonColor = 'blue',
    children,
}) => {
    const { t } = useTranslation();
    const defaultConfirmText = t('common.confirm');
    const defaultCancelText = t('common.cancel');

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/80 justify-center items-center px-6">
                <View className="w-full max-w-sm bg-zinc-900 p-6 rounded-3xl border border-zinc-800 items-center shadow-2xl shadow-black">
                    <Text className="text-2xl font-bold text-zinc-50 mb-4 text-center">{title}</Text>

                    {message && (
                        <Text className="text-zinc-400 text-base text-center mb-8">
                            {message}
                        </Text>
                    )}

                    {children}

                    <View className="flex-row justify-between w-full space-x-4">
                        <TouchableOpacity
                            className="flex-1 py-4 rounded-2xl items-center active:bg-zinc-800"
                            onPress={onCancel}
                        >
                            <Text className="text-zinc-400 font-bold text-base">{cancelText || defaultCancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`flex-[2] bg-${confirmButtonColor}-600 py-4 rounded-2xl items-center shadow-lg shadow-${confirmButtonColor}-500/20 active:bg-${confirmButtonColor}-500`}
                            onPress={onConfirm}
                        >
                            <Text className="text-white font-bold text-lg">{confirmText || defaultConfirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
