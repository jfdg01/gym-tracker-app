import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

type HeaderActionProps = {
    icon?: React.ReactNode;
    label?: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'icon' | 'link';
};

export const HeaderAction = ({
    icon,
    label,
    onPress,
    variant = 'secondary'
}: HeaderActionProps) => {
    if (variant === 'icon') {
        return (
            <TouchableOpacity
                onPress={onPress}
                className="bg-zinc-800 p-2 rounded-lg border border-zinc-700 items-center justify-center"
            >
                {icon}
            </TouchableOpacity>
        );
    }

    if (variant === 'link') {
        return (
            <TouchableOpacity onPress={onPress} className="py-2 px-1">
                <Text className="text-blue-500 text-lg font-medium">{label}</Text>
            </TouchableOpacity>
        );
    }

    const baseStyles = "flex-row items-center justify-center rounded-xl";
    const variantStyles = variant === 'primary'
        ? "bg-blue-500 px-4 py-2"
        : "bg-zinc-800 border border-zinc-700 px-3 py-2";

    return (
        <TouchableOpacity
            onPress={onPress}
            className={`${baseStyles} ${variantStyles}`}
        >
            {icon && <View className={label ? "mr-2" : ""}>{icon}</View>}
            {label && (
                <Text className={`font-bold text-sm ${variant === 'primary' ? 'text-white' : 'text-zinc-300'}`}>
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
};
