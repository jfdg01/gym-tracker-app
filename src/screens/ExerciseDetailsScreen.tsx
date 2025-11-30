import { Text, View, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Layout } from '../components/Layout';
import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { db } from '../db/client';
import { exercises, performed_sets, sessions } from '../db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ExerciseDetailsRouteProp = RouteProp<RootStackParamList, 'ExerciseDetails'>;
type ExerciseDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExerciseDetails'>;

export const ExerciseDetailsScreen = () => {
    const navigation = useNavigation<ExerciseDetailsNavigationProp>();
    const route = useRoute<ExerciseDetailsRouteProp>();
    const { exerciseId } = route.params;
    const [exercise, setExercise] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);

    const loadExercise = async () => {
        try {
            const result = await db.select().from(exercises).where(eq(exercises.id, exerciseId));
            if (result.length > 0) {
                setExercise(result[0]);
            } else {
                Alert.alert('Error', 'Exercise not found');
                navigation.goBack();
            }

            // Load History
            const historyResult = await db.select({
                date: sessions.started_at,
                weight: performed_sets.weight,
                reps: performed_sets.reps,
                onerm: sql<number>`${performed_sets.weight} * (1 + ${performed_sets.reps} / 30)`,
            })
                .from(performed_sets)
                .innerJoin(sessions, eq(performed_sets.session_id, sessions.id))
                .where(eq(performed_sets.exercise_id, exerciseId))
                .orderBy(desc(sessions.started_at))
                .limit(5);

            setHistory(historyResult);

        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load exercise');
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadExercise();
        }, [exerciseId])
    );

    const handleDelete = () => {
        Alert.alert(
            'Delete Exercise',
            'Are you sure you want to delete this exercise? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Check for usage in history or programs before deleting (TODO)
                            // For now, just delete
                            await db.delete(exercises).where(eq(exercises.id, exerciseId));
                            navigation.goBack();
                        } catch (e) {
                            console.error(e);
                            Alert.alert('Error', 'Failed to delete exercise');
                        }
                    },
                },
            ]
        );
    };

    if (!exercise) return <Layout><View className="flex-1 bg-background justify-center items-center"><Text className="text-textMain">Loading...</Text></View></Layout>;

    return (
        <Layout>
            <View className="flex-1 bg-background pt-4">
                <View className="flex-row justify-between items-center mb-6 px-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="bg-surfaceHighlight p-2 rounded-full">
                        <Text className="text-textMain text-sm font-medium">Back</Text>
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-textMain">Details</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('ExerciseForm', { exerciseId })}>
                        <Text className="text-primary text-lg font-bold">Edit</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                    <View className="space-y-6 pb-10">
                        <View>
                            <Text className="text-3xl font-bold text-textMain mb-2">{exercise.name}</Text>
                            {exercise.variant && <Text className="text-textMuted text-xl">{exercise.variant}</Text>}
                        </View>

                        <View className="flex-row space-x-3">
                            {exercise.muscle_group && (
                                <View className="bg-blue-500/20 px-4 py-2 rounded-full border border-blue-500/30">
                                    <Text className="text-blue-400 font-medium">{exercise.muscle_group}</Text>
                                </View>
                            )}
                            {exercise.equipment && (
                                <View className="bg-surfaceHighlight px-4 py-2 rounded-full border border-zinc-700">
                                    <Text className="text-textMuted font-medium">{exercise.equipment}</Text>
                                </View>
                            )}
                        </View>

                        {exercise.description && (
                            <View className="bg-surface p-5 rounded-2xl border border-surfaceHighlight">
                                <Text className="text-lg font-bold text-textMain mb-3">Instructions</Text>
                                <Text className="text-textMuted leading-7">{exercise.description}</Text>
                            </View>
                        )}

                        {exercise.photo_url && (
                            <View>
                                <Image
                                    source={{ uri: exercise.photo_url }}
                                    className="w-full h-64 rounded-2xl bg-surfaceHighlight border border-surfaceHighlight"
                                    resizeMode="cover"
                                />
                            </View>
                        )}

                        {/* History Section */}
                        <View>
                            <Text className="text-xl font-bold text-textMain mb-4">Recent History</Text>
                            {history.length === 0 ? (
                                <View className="bg-surface p-6 rounded-2xl border border-surfaceHighlight items-center">
                                    <Text className="text-textMuted italic">No history yet.</Text>
                                </View>
                            ) : (
                                <View className="bg-surface rounded-2xl border border-surfaceHighlight overflow-hidden">
                                    {history.map((item, index) => (
                                        <View key={index} className={`flex-row justify-between items-center p-4 ${index !== history.length - 1 ? 'border-b border-surfaceHighlight' : ''}`}>
                                            <Text className="text-textMuted">{new Date(item.date).toLocaleDateString()}</Text>
                                            <View className="flex-row items-center space-x-4">
                                                <Text className="text-textMain font-bold text-lg">{item.weight}kg <Text className="text-textMuted text-sm font-normal">x {item.reps}</Text></Text>
                                                <View className="bg-surfaceHighlight px-2 py-1 rounded-md">
                                                    <Text className="text-textMuted text-xs">1RM: {Math.round(item.onerm)}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={handleDelete}
                            className="mt-4 bg-red-500/10 p-4 rounded-xl items-center border border-red-500/20 active:bg-red-500/20"
                        >
                            <Text className="text-red-500 font-bold text-lg">Delete Exercise</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </Layout>
    );
};
