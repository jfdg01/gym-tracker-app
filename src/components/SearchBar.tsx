import React from 'react';
import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export const SearchBar = ({ value, onChangeText, placeholder }: SearchBarProps) => {
    const { t } = useTranslation();
    return (
        <View className="bg-zinc-900 p-3 rounded-xl flex-row items-center mb-6 border border-zinc-800">
            <Search size={20} color="#71717a" className="mr-3" />
            <TextInput
                className="flex-1 text-zinc-50 text-base"
                placeholder={placeholder || t('dayEditor.searchPlaceholder')}
                placeholderTextColor="#71717a"
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
};
