import { Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Layout } from '../components/Layout';
import { useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { db } from '../db/client';
import { exercises } from '../db/schema';
import { eq } from 'drizzle-orm';
import { RootStackParamList } from '../navigation/types';

type ExerciseFormRouteProp = RouteProp<RootStackParamList, 'ExerciseForm'>;

export const ExerciseFormScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<ExerciseFormRouteProp>();
    const exerciseId = route.params?.exerciseId;
    const isEditing = !!exerciseId;

    const [name, setName] = useState('');
    const [variant, setVariant] = useState('');
    const [muscle, setMuscle] = useState('');
    const [equipment, setEquipment] = useState('');
    const [description, setDescription] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');

    useEffect(() => {
        if (isEditing) {
            loadExercise();
        }
    }, [exerciseId]);

    const loadExercise = async () => {
        try {
            const result = await db.select().from(exercises).where(eq(exercises.id, exerciseId!));
            if (result.length > 0) {
                const ex = result[0];
                setName(ex.name);
                setVariant(ex.variant || '');
                setMuscle(ex.muscle_group || '');
                setEquipment(ex.equipment || '');
                setDescription(ex.description || '');
                setPhotoUrl(ex.photo_url || '');
            }
        } catch (e) {
            console.error('Failed to load exercise', e);
            Alert.alert('Error', 'Failed to load exercise details');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Name is required');
            return;
        }

        try {
            const exerciseData = {
                name,
                variant: variant || null,
                muscle_group: muscle || null,
                equipment: equipment || null,
                description: description || null,
                photo_url: photoUrl || null,
                is_custom: true,
            };

            if (isEditing) {
                await db.update(exercises)
                    .set(exerciseData)
                    .where(eq(exercises.id, exerciseId!));
            } else {
                await db.insert(exercises).values(exerciseData);
            }
            navigation.goBack();
        } catch (e) {
            console.error('Failed to save exercise', e);
            Alert.alert('Error', 'Failed to save exercise');
        }
    };

    return (
        <Layout>
            <View className="flex-1 bg-background pt-4">
                <View className="flex-row justify-between items-center mb-6 px-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="bg-surfaceHighlight p-2 rounded-full">
                        <Text className="text-textMain text-sm font-medium">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-textMain">{isEditing ? 'Edit Exercise' : 'New Exercise'}</Text>
                    <TouchableOpacity onPress={handleSave} className="bg-primary px-4 py-2 rounded-full">
                        <Text className="text-white text-sm font-bold">Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                    <View className="space-y-4 pb-10">
                        <View>
                            <Text className="text-textMuted mb-2 font-medium ml-1">Name *</Text>
                            <TextInput
                                className="bg-surfaceHighlight p-4 rounded-xl text-textMain border border-surfaceHighlight focus:border-primary"
                                placeholder="e.g. Bench Press"
                                placeholderTextColor="#52525b"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View>
                            <Text className="text-textMuted mb-2 font-medium ml-1">Variant</Text>
                            <TextInput
                                className="bg-surfaceHighlight p-4 rounded-xl text-textMain border border-surfaceHighlight focus:border-primary"
                                placeholder="e.g. Incline Dumbbell"
                                placeholderTextColor="#52525b"
                                value={variant}
                                onChangeText={setVariant}
                            />
                        </View>

                        <View className="flex-row space-x-4">
                            <View className="flex-1">
                                <Text className="text-textMuted mb-2 font-medium ml-1">Muscle Group</Text>
                                <TextInput
                                    className="bg-surfaceHighlight p-4 rounded-xl text-textMain border border-surfaceHighlight focus:border-primary"
                                    placeholder="e.g. Chest"
                                    placeholderTextColor="#52525b"
                                    value={muscle}
                                    onChangeText={setMuscle}
                                />
                            </View>

                            <View className="flex-1">
                                <Text className="text-textMuted mb-2 font-medium ml-1">Equipment</Text>
                                <TextInput
                                    className="bg-surfaceHighlight p-4 rounded-xl text-textMain border border-surfaceHighlight focus:border-primary"
                                    placeholder="e.g. Barbell"
                                    placeholderTextColor="#52525b"
                                    value={equipment}
                                    onChangeText={setEquipment}
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-textMuted mb-2 font-medium ml-1">Description</Text>
                            <TextInput
                                className="bg-surfaceHighlight p-4 rounded-xl text-textMain border border-surfaceHighlight focus:border-primary h-32"
                                placeholder="Instructions or tips..."
                                placeholderTextColor="#52525b"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        <View>
                            <Text className="text-textMuted mb-2 font-medium ml-1">Photo URL (Optional)</Text>
                            <TextInput
                                className="bg-surfaceHighlight p-4 rounded-xl text-textMain border border-surfaceHighlight focus:border-primary"
                                placeholder="https://..."
                                placeholderTextColor="#52525b"
                                value={photoUrl}
                                onChangeText={setPhotoUrl}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Layout>
    );
};
