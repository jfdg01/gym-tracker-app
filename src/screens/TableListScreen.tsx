import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '../db/client';
import { sql } from 'drizzle-orm';
import * as schema from '../db/schema';

export const TableListScreen = ({ route, navigation }: any) => {
    const { tableName } = route.params;
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // @ts-ignore
            const table = schema[tableName];
            if (!table) {
                console.error(`Table ${tableName} not found in schema`);
                return;
            }
            const result = await db.select().from(table);
            setData(result);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [tableName]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const handleDelete = async (id: number) => {
        try {
            // @ts-ignore
            const table = schema[tableName];
            await db.delete(table).where(sql`id = ${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="bg-white p-4 mb-2 rounded-lg shadow-sm flex-row justify-between items-center"
            onPress={() => navigation.navigate('EditRecord', { tableName, recordId: item.id })}
        >
            <View className="flex-1">
                <Text className="font-bold">ID: {item.id}</Text>
                <Text numberOfLines={1} className="text-gray-600">
                    {JSON.stringify(item)}
                </Text>
            </View>
            <TouchableOpacity
                className="bg-red-500 p-2 rounded ml-2"
                onPress={() => handleDelete(item.id)}
            >
                <Text className="text-white text-xs">Delete</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100 p-4" edges={['bottom', 'left', 'right']}>
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold capitalize">{tableName.replace('_', ' ')}</Text>
                <TouchableOpacity
                    className="bg-blue-500 p-2 rounded"
                    onPress={() => navigation.navigate('EditRecord', { tableName })}
                >
                    <Text className="text-white">Add New</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text className="text-center text-gray-500 mt-4">No records found</Text>}
                />
            )}
        </SafeAreaView>
    );
};
