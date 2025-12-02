import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABLES = [
    'items',
];

export const DebugDashboardScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    return (
        <SafeAreaView className="flex-1 bg-gray-100 p-4" edges={['bottom', 'left', 'right']}>
            <Text className="text-2xl font-bold mb-4 text-gray-800">{t('debug.databaseTables')}</Text>
            <FlatList
                data={TABLES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="bg-white p-4 mb-2 rounded-lg shadow-sm"
                        onPress={() => navigation.navigate('TableList', { tableName: item })}
                    >
                        <Text className="text-lg text-blue-600 capitalize">{item.replace('_', ' ')}</Text>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
};
