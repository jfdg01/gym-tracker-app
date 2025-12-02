import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../db/client';
import { sql } from 'drizzle-orm';
import * as schema from '../db/schema';

export const EditRecordScreen = ({ route, navigation }: any) => {
    const { tableName, recordId } = route.params;
    const isEditing = !!recordId;
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(isEditing);

    // @ts-ignore
    const tableSchema = schema[tableName];

    useEffect(() => {
        const fetchRecord = async () => {
            if (isEditing) {
                try {
                    const result = await db.select().from(tableSchema).where(sql`id = ${recordId}`).limit(1);
                    if (result.length > 0) {
                        setFormData(result[0]);
                    }
                } catch (error) {
                    console.error('Error fetching record:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setFormData({});
                setLoading(false);
            }
        };

        fetchRecord();
    }, [isEditing, recordId, tableName]);

    const getColumns = () => {
        // This is a bit hacky to get columns from Drizzle table object for UI generation
        // In a real app we might want explicit field definitions
        // For now, we'll try to infer from the record or a hardcoded list if empty
        // Better approach: inspect the schema object structure

        // Drizzle table object has a symbol for columns, but it's internal.
        // We can try to rely on the keys of the record if editing, 
        // or we might need a manual mapping of columns for each table if we want to support "Add" properly without types.

        // Let's try to use the keys from the schema object itself if possible, 
        // but Drizzle schema objects are complex.

        // FALLBACK: Hardcoded column names for this specific app's tables to ensure it works reliably.
        const columns: Record<string, string[]> = {
            items: ['name', 'description', 'created_at'],
            day_exercises: ['target_sets', 'target_reps', 'rest_time_seconds', 'min_reps', 'max_reps'],
        };

        return columns[tableName] || [];
    };

    const handleSave = async () => {
        try {
            // Clean up data types
            const dataToSave = { ...formData };
            const columns = getColumns();

            // Basic type conversion
            columns.forEach(col => {
                if (col.includes('_id') || col === 'order' || col === 'target_sets' || col === 'target_reps' || col === 'rest_time' || col === 'set_number' || col === 'reps' || col === 'rpe' || col === 'min_reps' || col === 'max_reps') {
                    if (dataToSave[col]) dataToSave[col] = parseInt(dataToSave[col], 10);
                }
                if (col === 'target_weight' || col === 'weight') {
                    if (dataToSave[col]) dataToSave[col] = parseFloat(dataToSave[col]);
                }
                if (col === 'schedule_sequence' && typeof dataToSave[col] === 'string') {
                    try {
                        dataToSave[col] = JSON.parse(dataToSave[col]);
                    } catch (e) {
                        // ignore, maybe it's already an object or invalid
                    }
                }
            });

            if (isEditing) {
                await db.update(tableSchema).set(dataToSave).where(sql`id = ${recordId}`);
            } else {
                await db.insert(tableSchema).values(dataToSave);
            }
            navigation.goBack();
        } catch (error: any) {
            console.error('Error saving record:', error);
            Alert.alert('Error', error.message);
        }
    };

    const renderField = (key: string) => {
        const value = formData[key];
        const isBoolean = key.startsWith('is_') || key === 'completed' || key === 'sound_enabled';

        if (isBoolean) {
            return (
                <View key={key} className="mb-4 flex-row justify-between items-center">
                    <Text className="font-bold capitalize">{key.replace('_', ' ')}</Text>
                    <Switch
                        value={!!value}
                        onValueChange={(val) => setFormData({ ...formData, [key]: val })}
                    />
                </View>
            );
        }

        const stringValue = typeof value === 'object' ? JSON.stringify(value) : (value?.toString() || '');

        return (
            <View key={key} className="mb-4">
                <Text className="font-bold mb-1 capitalize">{key.replace('_', ' ')}</Text>
                <TextInput
                    className="bg-white p-3 rounded border border-gray-300"
                    value={stringValue}
                    onChangeText={(text) => setFormData({ ...formData, [key]: text })}
                    placeholder={`Enter ${key}`}
                />
            </View>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100 p-4" edges={['bottom', 'left', 'right']}>
            <ScrollView className="flex-1">
                {getColumns().map(col => renderField(col))}
            </ScrollView>
            <TouchableOpacity
                className="bg-blue-600 p-4 rounded-lg mt-4 items-center"
                onPress={handleSave}
            >
                <Text className="text-white font-bold text-lg">Save</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};
