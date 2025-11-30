import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Layout } from '../components/Layout';
import { FlashList } from '@shopify/flash-list';
import { useEffect, useState } from 'react';
import { db } from '../db/client';
import { exercises } from '../db/schema';
import { desc, like } from 'drizzle-orm';

import { useNavigation } from '@react-navigation/native';
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

    useEffect(() => {
        fetchExercises();
    }, [search]);

    const renderItem = ({ item }: { item: Exercise }) => (
        <View className="p-4 border-b border-gray-200 bg-white">
            <Text className="text-lg font-semibold">{item.name}</Text>
            <Text className="text-gray-500">{item.muscle_group} • {item.equipment}</Text>
        </View>
    );

    return (
        <Layout>
            <View className="mb-4">
                <Text className="text-2xl font-bold mb-4">Exercises</Text>
                <TextInput
                    className="bg-gray-100 p-3 rounded-lg"
                    placeholder="Search exercises..."
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <View className="flex-1">
                <FlashList
                    data={data}
                    renderItem={renderItem}
                />
            </View>

            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full justify-center items-center shadow-lg"
                onPress={() => navigation.navigate('CreateExercise')}
            >
                <Text className="text-white text-3xl font-bold">+</Text>
            </TouchableOpacity>
        </Layout>
    );
};
