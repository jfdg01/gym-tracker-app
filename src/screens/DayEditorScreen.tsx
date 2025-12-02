import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../db/client';
import { days, day_exercises, exercises } from '../db/schema';
import { eq, asc, like } from 'drizzle-orm';
import { addExerciseToDay, removeExerciseFromDay, reorderExercisesInDay, updateDay } from '../db/plans';

type DayExerciseItem = {
    id: number; // day_exercise id
    exercise_id: number;
    name: string;
    sets: number;
    reps: number;
    order_index: number;
};

export const DayEditorScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { dayId } = route.params as { dayId: number };

    const [dayName, setDayName] = useState('');
    const [isRestDay, setIsRestDay] = useState(false);
    const [exercisesList, setExercisesList] = useState<DayExerciseItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Picker State
    const [pickerVisible, setPickerVisible] = useState(false);
    const [search, setSearch] = useState('');
    const [allExercises, setAllExercises] = useState<typeof exercises.$inferSelect[]>([]);

    useEffect(() => {
        loadDayDetails();
    }, []);

    useEffect(() => {
        if (pickerVisible) {
            loadAllExercises();
        }
    }, [pickerVisible, search]);

    const loadDayDetails = async () => {
        const day = await db.select().from(days).where(eq(days.id, dayId)).get();
        if (day) {
            setDayName(day.name);
            setIsRestDay(day.is_rest_day || false);
        }

        const exs = await db.select({
            id: day_exercises.id,
            exercise_id: exercises.id,
            name: exercises.name,
            sets: exercises.sets,
            reps: exercises.max_reps,
            order_index: day_exercises.order_index
        })
            .from(day_exercises)
            .innerJoin(exercises, eq(day_exercises.exercise_id, exercises.id))
            .where(eq(day_exercises.day_id, dayId))
            .orderBy(asc(day_exercises.order_index));

        setExercisesList(exs as any);
        setLoading(false);
    };

    const loadAllExercises = async () => {
        let query = db.select().from(exercises);
        if (search) {
            // @ts-ignore - simple like search
            query = query.where(like(exercises.name, `%${search}%`));
        }
        const results = await query;
        setAllExercises(results);
    };

    const handleSaveDaySettings = async () => {
        await updateDay(dayId, { name: dayName, is_rest_day: isRestDay });
    };

    const handleAddExercise = () => {
        setPickerVisible(true);
    };

    const handleSelectExercise = async (exerciseId: number) => {
        await addExerciseToDay(dayId, exerciseId);
        setPickerVisible(false);
        setSearch('');
        loadDayDetails();
    };

    const handleRemoveExercise = async (id: number) => {
        await removeExerciseFromDay(id);
        loadDayDetails();
    };

    const handleMoveUp = async (index: number) => {
        if (index === 0) return;
        const newOrder = [...exercisesList];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        setExercisesList(newOrder); // Optimistic update

        const ids = newOrder.map(e => e.id);
        await reorderExercisesInDay(dayId, ids);
        loadDayDetails(); // Refresh to be sure
    };

    const handleMoveDown = async (index: number) => {
        if (index === exercisesList.length - 1) return;
        const newOrder = [...exercisesList];
        [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
        setExercisesList(newOrder); // Optimistic update

        const ids = newOrder.map(e => e.id);
        await reorderExercisesInDay(dayId, ids);
        loadDayDetails();
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top', 'left', 'right']}>
            <View className="px-4 py-2 border-b border-zinc-900 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-blue-500 text-lg">Done</Text>
                </TouchableOpacity>
                <Text className="text-zinc-50 text-xl font-bold">Edit Day</Text>
                <View className="w-10" />
            </View>

            <View className="p-4 border-b border-zinc-900">
                <Text className="text-zinc-500 text-xs uppercase font-bold mb-2">Day Name</Text>
                <TextInput
                    className="bg-zinc-900 text-zinc-50 p-4 rounded-xl border border-zinc-800 mb-4"
                    value={dayName}
                    onChangeText={setDayName}
                    onEndEditing={handleSaveDaySettings}
                />

                <View className="flex-row justify-between items-center bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                    <Text className="text-zinc-50 font-bold">Rest Day</Text>
                    <Switch
                        value={isRestDay}
                        onValueChange={(val) => {
                            setIsRestDay(val);
                            updateDay(dayId, { is_rest_day: val });
                        }}
                        trackColor={{ false: '#3f3f46', true: '#2563eb' }}
                    />
                </View>
            </View>

            {!isRestDay ? (
                <FlatList
                    data={exercisesList}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    ListHeaderComponent={
                        <Text className="text-zinc-500 text-xs uppercase font-bold mb-4">Exercises</Text>
                    }
                    renderItem={({ item, index }) => (
                        <View className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-3">
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-1">
                                    <Text className="text-zinc-50 font-bold text-lg">{item.name}</Text>
                                    <Text className="text-zinc-500">{item.sets} sets x {item.reps} reps</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleRemoveExercise(item.id)} className="bg-red-900/30 px-3 py-1 rounded">
                                    <Text className="text-red-400 text-xs font-bold">Remove</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row justify-end mt-2 space-x-2">
                                <TouchableOpacity
                                    onPress={() => handleMoveUp(index)}
                                    disabled={index === 0}
                                    className={`p-2 rounded ${index === 0 ? 'opacity-30' : 'bg-zinc-800'}`}
                                >
                                    <Text className="text-zinc-400 font-bold">↑</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleMoveDown(index)}
                                    disabled={index === exercisesList.length - 1}
                                    className={`p-2 rounded ${index === exercisesList.length - 1 ? 'opacity-30' : 'bg-zinc-800'}`}
                                >
                                    <Text className="text-zinc-400 font-bold">↓</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListFooterComponent={
                        <TouchableOpacity
                            className="bg-blue-600 p-4 rounded-xl items-center mt-4"
                            onPress={handleAddExercise}
                        >
                            <Text className="text-white font-bold">Add Exercise</Text>
                        </TouchableOpacity>
                    }
                />
            ) : (
                <View className="flex-1 justify-center items-center p-8">
                    <Text className="text-zinc-500 text-center text-lg">This is a Rest Day.</Text>
                    <Text className="text-zinc-600 text-center mt-2">No exercises can be added.</Text>
                </View>
            )}

            {/* Exercise Picker Modal */}
            <Modal
                visible={pickerVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setPickerVisible(false)}
            >
                <View className="flex-1 bg-zinc-950">
                    <View className="px-4 py-4 border-b border-zinc-900 flex-row items-center justify-between">
                        <Text className="text-zinc-50 text-xl font-bold">Select Exercise</Text>
                        <TouchableOpacity onPress={() => setPickerVisible(false)}>
                            <Text className="text-blue-500 text-lg font-bold">Close</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="p-4">
                        <TextInput
                            className="bg-zinc-900 text-zinc-50 p-4 rounded-xl border border-zinc-800"
                            placeholder="Search exercises..."
                            placeholderTextColor="#71717a"
                            value={search}
                            onChangeText={setSearch}
                            autoFocus
                        />
                    </View>

                    <FlatList
                        data={allExercises}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className="px-6 py-4 border-b border-zinc-900 active:bg-zinc-900"
                                onPress={() => handleSelectExercise(item.id)}
                            >
                                <Text className="text-zinc-50 font-bold text-lg">{item.name}</Text>
                                {item.description && (
                                    <Text className="text-zinc-500 text-sm" numberOfLines={1}>{item.description}</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </SafeAreaView>
    );
};
