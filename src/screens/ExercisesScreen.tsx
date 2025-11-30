import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Layout } from '../components/Layout';
import { FlashList } from '@shopify/flash-list';
import { useEffect, useState, useCallback } from 'react';
import { db } from '../db/client';
import { exercises } from '../db/schema';
import { desc, like } from 'drizzle-orm';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Exercise = typeof exercises.$inferSelect;

export const ExercisesScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [data, setData] = useState<Exercise[]>([]);
    const [search, setSearch] = useState('');

    const fetchExercises = async () => {
        try {
            const query = db.select().from(exercises);
            if (search) {
                query.where(like(exercises.name, `%${search}%`));
            }
            const result = await query.orderBy(desc(exercises.created_at));
            setData(result);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchExercises();
        }, [search])
    );

    const renderItem = ({ item }: { item: Exercise }) => (
        <TouchableOpacity
            className="p-4 mb-3 bg-surface rounded-2xl border border-surfaceHighlight shadow-sm flex-row justify-between items-center"
            onPress={() => navigation.navigate('ExerciseDetails', { exerciseId: item.id })}
        >
            <View>
                <Text className="text-lg font-bold text-textMain mb-1">{item.name}</Text>
                <Text className="text-textMuted text-sm">{item.muscle_group} • {item.equipment}</Text>
            </View>
            <View className="bg-surfaceHighlight w-8 h-8 rounded-full items-center justify-center">
                <Text className="text-textMuted text-xs">{'>'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Layout>
            <View className="flex-1 bg-background pt-4">
                <View className="mb-6 px-4">
                    <Text className="text-3xl font-bold text-textMain mb-4">Exercises</Text>
                    <TextInput
                        className="bg-surfaceHighlight p-4 rounded-xl text-textMain border border-surfaceHighlight focus:border-primary"
                        placeholder="Search exercises..."
                        placeholderTextColor="#a1a1aa"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <View className="flex-1">
                    <FlashList
                        data={data}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>

                <TouchableOpacity
                    className="absolute bottom-6 right-6 bg-primary w-16 h-16 rounded-full justify-center items-center shadow-lg shadow-blue-900/50"
                    onPress={() => navigation.navigate('ExerciseForm', {})}
                >
                    <Text className="text-white text-4xl font-light pb-1">+</Text>
                </TouchableOpacity>
            </View>
        </Layout>
    );
};
