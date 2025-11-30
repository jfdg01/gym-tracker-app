import { Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Modal, FlatList } from 'react-native';
import { Layout } from '../components/Layout';
import { useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { db } from '../db/client';
import { exercises } from '../db/schema';
import { eq } from 'drizzle-orm';
import { RootStackParamList } from '../navigation/types';

type ExerciseFormRouteProp = RouteProp<RootStackParamList, 'ExerciseForm'>;

const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Full Body"];
const EQUIPMENT_LIST = ["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight", "Band", "Kettlebell", "Other"];

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

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'muscle' | 'equipment' | null>(null);

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

    const openModal = (type: 'muscle' | 'equipment') => {
        setModalType(type);
        setModalVisible(true);
    };

    const handleSelect = (item: string) => {
        if (modalType === 'muscle') setMuscle(item);
        if (modalType === 'equipment') setEquipment(item);
        setModalVisible(false);
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
                                <TouchableOpacity
                                    onPress={() => openModal('muscle')}
                                    className="bg-surfaceHighlight p-4 rounded-xl border border-surfaceHighlight"
                                >
                                    <Text className={muscle ? "text-textMain" : "text-zinc-500"}>
                                        {muscle || "Select..."}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-1">
                                <Text className="text-textMuted mb-2 font-medium ml-1">Equipment</Text>
                                <TouchableOpacity
                                    onPress={() => openModal('equipment')}
                                    className="bg-surfaceHighlight p-4 rounded-xl border border-surfaceHighlight"
                                >
                                    <Text className={equipment ? "text-textMain" : "text-zinc-500"}>
                                        {equipment || "Select..."}
                                    </Text>
                                </TouchableOpacity>
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

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-surface rounded-t-3xl p-6 h-1/2">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-xl font-bold text-textMain">
                                    Select {modalType === 'muscle' ? 'Muscle Group' : 'Equipment'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Text className="text-primary font-medium">Close</Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={modalType === 'muscle' ? MUSCLE_GROUPS : EQUIPMENT_LIST}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        className="py-4 border-b border-surfaceHighlight"
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text className="text-textMain text-lg">{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </Modal>
            </View>
        </Layout>
    );
};
