import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Layout } from '../components/Layout';
import { FlashList } from '@shopify/flash-list';
import { useEffect, useState, useCallback } from 'react';
import { db } from '../db/client';
import { exercises } from '../db/schema';
import { desc, like, and, eq } from 'drizzle-orm';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Exercise = typeof exercises.$inferSelect;

const MUSCLE_GROUPS = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"];

export const ExercisesScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [data, setData] = useState<Exercise[]>([]);
    const [search, setSearch] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState('All');

    const fetchExercises = async () => {
        try {
            let query = db.select().from(exercises);
            const conditions = [];

            if (search) {
                conditions.push(like(exercises.name, `%${search}%`));
            }

            if (selectedMuscle !== 'All') {
                conditions.push(eq(exercises.muscle_group, selectedMuscle));
            }

            if (conditions.length > 0) {
                // @ts-ignore - Drizzle types can be tricky with dynamic and()
                query = query.where(and(...conditions));
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
        }, [search, selectedMuscle])
    );

    const renderItem = ({ item }: { item: Exercise }) => (
        <TouchableOpacity
            className="p-4 mb-3 bg-surface rounded-2xl border border-surfaceHighlight shadow-sm flex-row justify-between items-center active:bg-surfaceHighlight"
            onPress={() => navigation.navigate('ExerciseDetails', { exerciseId: item.id })}
        >
            <View className="flex-1 mr-4">
                <View className="flex-row items-center mb-1">
                    <Text className="text-lg font-bold text-textMain mr-2">{item.name}</Text>
                    {item.variant && (
                        <View className="bg-primary/20 px-2 py-0.5 rounded-md">
                            <Text className="text-primary text-xs font-medium">{item.variant}</Text>
                        </View>
                    )}
                </View>
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
                <View className="mb-4 px-4">
                    <Text className="text-3xl font-bold text-textMain mb-4">Exercises</Text>
                    <TextInput
                        className="bg-surfaceHighlight p-4 rounded-xl text-textMain border border-surfaceHighlight focus:border-primary mb-4"
                        placeholder="Search exercises..."
                        placeholderTextColor="#a1a1aa"
                        value={search}
                        onChangeText={setSearch}
                    />

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="flex-row"
                        contentContainerStyle={{ paddingRight: 16 }}
                    >
                        {MUSCLE_GROUPS.map((muscle) => (
                            <TouchableOpacity
                                key={muscle}
                                onPress={() => setSelectedMuscle(muscle)}
                                className={`mr-2 px-4 py-2 rounded-full border ${selectedMuscle === muscle
                                    ? 'bg-primary border-primary'
                                    : 'bg-surface border-surfaceHighlight'
                                    }`}
                            >
                                <Text className={`font-medium ${selectedMuscle === muscle ? 'text-white' : 'text-textMuted'
                                    }`}>
                                    {muscle}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
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
