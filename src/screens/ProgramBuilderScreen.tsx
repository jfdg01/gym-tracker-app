import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Layout } from '../components/Layout';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export const ProgramBuilderScreen = () => {
    const navigation = useNavigation();
    const [programName, setProgramName] = useState('');
    const [days, setDays] = useState([
        { id: 1, name: 'Push A', exercises: ['Bench Press', 'Overhead Press', 'Tricep Extension'] },
        { id: 2, name: 'Pull A', exercises: ['Pull Up', 'Barbell Row', 'Bicep Curl'] },
        { id: 3, name: 'Legs', exercises: ['Squat', 'Leg Press', 'Calf Raise'] },
    ]);

    return (
        <Layout>
            <View className="flex-1 bg-background pt-4">
                <View className="flex-row justify-between items-center mb-6 px-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="bg-surfaceHighlight p-2 rounded-full">
                        <Ionicons name="arrow-back" size={24} color="#fafafa" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-textMain">Program Builder</Text>
                    <TouchableOpacity className="bg-primary px-4 py-2 rounded-full">
                        <Text className="text-white text-sm font-bold">Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                    <View className="mb-6">
                        <Text className="text-textMuted mb-2 font-medium ml-1">Program Name</Text>
                        <TextInput
                            className="bg-surfaceHighlight p-4 rounded-xl text-textMain border border-surfaceHighlight focus:border-primary text-lg font-bold"
                            placeholder="e.g. PPL Split"
                            placeholderTextColor="#52525b"
                            value={programName}
                            onChangeText={setProgramName}
                        />
                    </View>

                    <View className="mb-4 flex-row justify-between items-center">
                        <Text className="text-xl font-bold text-textMain">Workout Days</Text>
                        <TouchableOpacity className="flex-row items-center space-x-1">
                            <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
                            <Text className="text-primary font-bold">Add Day</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="space-y-4 pb-20">
                        {days.map((day) => (
                            <TouchableOpacity key={day.id} className="bg-surface p-5 rounded-2xl border border-surfaceHighlight">
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="text-lg font-bold text-textMain">{day.name}</Text>
                                    <Ionicons name="ellipsis-horizontal" size={20} color="#a1a1aa" />
                                </View>
                                <View className="flex-row flex-wrap">
                                    {day.exercises.map((ex, idx) => (
                                        <View key={idx} className="bg-surfaceHighlight px-3 py-1 rounded-md mr-2 mb-2">
                                            <Text className="text-textMuted text-xs">{ex}</Text>
                                        </View>
                                    ))}
                                    <View className="bg-surfaceHighlight px-3 py-1 rounded-md mb-2 border border-dashed border-zinc-600">
                                        <Text className="text-textMuted text-xs">+ Add</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </Layout>
    );
};
