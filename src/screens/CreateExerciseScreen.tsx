import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Layout } from '../components/Layout';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { db } from '../db/client';
import { exercises } from '../db/schema';

export const CreateExerciseScreen = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [muscle, setMuscle] = useState('');
    const [equipment, setEquipment] = useState('');

    const handleSave = async () => {
        if (!name) return;
        try {
            await db.insert(exercises).values({
                name,
                muscle_group: muscle,
                equipment: equipment,
                is_custom: true,
            });
            navigation.goBack();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Layout>
            <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-blue-600 text-lg">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-xl font-bold">New Exercise</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text className="text-blue-600 text-lg font-bold">Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-600 mb-1">Name</Text>
                        <TextInput
                            className="bg-gray-100 p-3 rounded-lg"
                            placeholder="e.g. Bench Press"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-600 mb-1">Muscle Group</Text>
                        <TextInput
                            className="bg-gray-100 p-3 rounded-lg"
                            placeholder="e.g. Chest"
                            value={muscle}
                            onChangeText={setMuscle}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-600 mb-1">Equipment</Text>
                        <TextInput
                            className="bg-gray-100 p-3 rounded-lg"
                            placeholder="e.g. Barbell"
                            value={equipment}
                            onChangeText={setEquipment}
                        />
                    </View>
                </View>
            </ScrollView>
        </Layout>
    );
};
