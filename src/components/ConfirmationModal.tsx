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
    onCancel?: () => void; // Optional - if not provided, shows only confirm button (alert mode)
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

    const colorVariants: Record<string, string> = {
        blue: 'bg-blue-600 shadow-blue-500/20 active:bg-blue-500',
        red: 'bg-red-600 shadow-red-500/20 active:bg-red-500',
        emerald: 'bg-emerald-600 shadow-emerald-500/20 active:bg-emerald-500',
    };

    const buttonStyle = colorVariants[confirmButtonColor] || colorVariants.blue;

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

                    {onCancel ? (
                        // Confirmation mode: Show both buttons
                        <View className="flex-row justify-between w-full space-x-4">
                            <TouchableOpacity
                                className="flex-1 py-4 rounded-2xl items-center active:bg-zinc-800"
                                onPress={onCancel}
                            >
                                <Text className="text-zinc-400 font-bold text-base">{cancelText || defaultCancelText}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`flex-[2] py-4 rounded-2xl items-center shadow-lg ${buttonStyle}`}
                                onPress={onConfirm}
                            >
                                <Text className="text-white font-bold text-lg">{confirmText || defaultConfirmText}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Alert mode: Show only confirm button
                        <TouchableOpacity
                            className={`w-full py-4 rounded-2xl items-center shadow-lg ${buttonStyle}`}
                            onPress={onConfirm}
                        >
                            <Text className="text-white font-bold text-lg">{confirmText || 'OK'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};
