import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState = ({
    icon: Icon,
    title,
    message,
    actionLabel,
    onAction
}: EmptyStateProps) => {
    return (
        <View className="flex-1 items-center justify-center p-8">
            {Icon && (
                <View className="bg-zinc-900 p-6 rounded-full mb-6 border border-zinc-800 shadow-sm">
                    <Icon size={48} color="#3b82f6" strokeWidth={1.5} />
                </View>
            )}

            <Text className="text-zinc-50 text-xl font-bold text-center mb-3">
                {title}
            </Text>

            <Text className="text-zinc-400 text-base text-center leading-relaxed mb-8">
                {message}
            </Text>

            {actionLabel && onAction && (
                <TouchableOpacity
                    onPress={onAction}
                    className="bg-blue-500 px-8 py-4 rounded-full shadow-lg shadow-blue-500/20 active:bg-blue-600"
                >
                    <Text className="text-white font-bold text-base">
                        {actionLabel}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
