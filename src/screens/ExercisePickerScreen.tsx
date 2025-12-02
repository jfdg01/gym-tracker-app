import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../db/client';
import { exercises } from '../db/schema';
import { like } from 'drizzle-orm';

export const ExercisePickerScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { onSelect } = route.params as { onSelect: (exerciseId: number) => void };

    const [search, setSearch] = useState('');
    const [exerciseList, setExerciseList] = useState<typeof exercises.$inferSelect[]>([]);

    useEffect(() => {
        loadExercises();
    }, [search]);

    const loadExercises = async () => {
        let query = db.select().from(exercises);
        if (search) {
            // @ts-ignore - simple like search
            query = query.where(like(exercises.name, `%${search}%`));
        }
        const results = await query;
        setExerciseList(results);
    };

    const handleSelect = (id: number) => {
        onSelect(id);
        navigation.goBack();
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top', 'left', 'right']}>
            <View className="px-4 py-2 border-b border-zinc-900 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <Text className="text-blue-500 text-lg">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-zinc-50 text-xl font-bold">Select Exercise</Text>
            </View>

            <View className="p-4">
                <TextInput
                    className="bg-zinc-900 text-zinc-50 p-4 rounded-xl border border-zinc-800"
                    placeholder="Search exercises..."
                    placeholderTextColor="#71717a"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <FlatList
                data={exerciseList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="px-6 py-4 border-b border-zinc-900 active:bg-zinc-900"
                        onPress={() => handleSelect(item.id)}
                    >
                        <Text className="text-zinc-50 font-bold text-lg">{item.name}</Text>
                        {item.description && (
                            <Text className="text-zinc-500 text-sm" numberOfLines={1}>{item.description}</Text>
                        )}
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
};
