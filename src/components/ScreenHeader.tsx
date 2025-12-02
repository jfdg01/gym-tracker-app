import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

type ScreenHeaderProps = {
    title: string;
    subtitle?: string;
    leftAction?: React.ReactNode;
    rightAction?: React.ReactNode;
    variant?: 'default' | 'modal';
    showBackButton?: boolean;
    onBack?: () => void;
};

export const ScreenHeader = ({
    title,
    subtitle,
    leftAction,
    rightAction,
    variant = 'default',
    showBackButton = false,
    onBack,
}: ScreenHeaderProps) => {
    const navigation = useNavigation();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    if (variant === 'modal') {
        return (
            <View className="px-4 py-2 border-b border-zinc-900 flex-row items-center justify-between bg-zinc-950">
                <View className="flex-1 items-start">
                    {showBackButton && !leftAction && (
                        <TouchableOpacity onPress={handleBack} className="flex-row items-center">
                            <ChevronLeft size={24} color="#3b82f6" />
                            <Text className="text-blue-500 text-lg ml-1">Back</Text>
                        </TouchableOpacity>
                    )}
                    {leftAction}
                </View>

                <View className="flex-[2] items-center">
                    <Text className="text-zinc-50 text-xl font-bold text-center" numberOfLines={1}>
                        {title}
                    </Text>
                </View>

                <View className="flex-1 items-end">
                    {rightAction || <View className="w-8" />}
                </View>
            </View>
        );
    }

    // Default variant
    return (
        <View className="px-6 py-4 border-b border-zinc-900 flex-row justify-between items-center bg-zinc-950">
            <View className="flex-1 mr-4">
                {subtitle && (
                    <Text className="text-zinc-400 text-xs uppercase tracking-wider font-bold mb-1">
                        {subtitle}
                    </Text>
                )}
                <Text className="text-3xl font-bold text-zinc-50" numberOfLines={1} adjustsFontSizeToFit>
                    {title}
                </Text>
            </View>
            <View className="flex-row items-center space-x-2">
                {rightAction}
            </View>
        </View>
    );
};
