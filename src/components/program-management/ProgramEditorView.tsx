import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, ChevronUp, ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { db } from '../../db/client';
import { programs, days, day_exercises, exercises } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import { updatePlan, addDayToPlan, deleteDay, reorderDays, deletePlan, addExerciseToDay } from '../../db/plans';
import { useProgram } from '../../context/ProgramContext';
import { DayItem, DayExerciseItem } from '../../types/program-management';
import { ScreenHeader } from '../ScreenHeader';
import { HeaderAction } from '../HeaderAction';
import { ConfirmationModal } from '../ConfirmationModal';
import { DayCard } from './DayCard';
import { ExercisePickerModal } from './ExercisePickerModal';
import { ExerciseFormModal } from '../ExerciseFormModal';
import { getExerciseById, updateExercise, Exercise, NewExercise } from '../../db/exercises';
import { useNavigation } from '@react-navigation/native';

type ProgramEditorViewProps = {
    programId: number;
    onBack: () => void;
};

export const ProgramEditorView = ({
    programId,
    onBack
}: ProgramEditorViewProps) => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { currentProgramId, refreshProgram } = useProgram();
    const [programName, setProgramName] = useState('');
    const [programDesc, setProgramDesc] = useState('');
    const [daysList, setDaysList] = useState<DayItem[]>([]);
    const [daysExercises, setDaysExercises] = useState<Record<number, DayExerciseItem[]>>({});
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [isDaysListCollapsed, setIsDaysListCollapsed] = useState(false);

    // Picker State
    const [pickerVisible, setPickerVisible] = useState(false);
    const [activeDayId, setActiveDayId] = useState<number | null>(null);

    // Edit Exercise State
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

    useEffect(() => {
        loadProgramDetails();
    }, [programId]);

    const loadProgramDetails = async () => {
        const prog = await db.select().from(programs).where(eq(programs.id, programId)).get();
        if (prog) {
            setProgramName(prog.name);
            setProgramDesc(prog.description || '');
        }

        const d = await db.select().from(days)
            .where(eq(days.program_id, programId))
            .orderBy(asc(days.order_index));

        setDaysList(d);

        // Load exercises for all days
        const exercisesMap: Record<number, DayExerciseItem[]> = {};
        for (const day of d) {
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
                .where(eq(day_exercises.day_id, day.id))
                .orderBy(asc(day_exercises.order_index));
            exercisesMap[day.id] = exs as any;
        }
        setDaysExercises(exercisesMap);
    };

    const handleSaveMeta = async () => {
        await updatePlan(programId, { name: programName, description: programDesc });
        if (programId === currentProgramId) refreshProgram();
    };

    const handleAddDay = async () => {
        await addDayToPlan(programId, `Day ${daysList.length + 1}`);
        if (programId === currentProgramId) refreshProgram();
        loadProgramDetails();
    };

    const handleDeleteDay = async (dayId: number) => {
        Alert.alert(
            t('programEditor.deleteDayTitle'),
            t('common.areYouSure'),
            [
                { text: t('common.cancel'), style: "cancel" },
                {
                    text: t('common.delete'),
                    style: "destructive",
                    onPress: async () => {
                        await deleteDay(dayId);
                        loadProgramDetails();
                        if (programId === currentProgramId) refreshProgram();
                    }
                }
            ]
        );
    };

    const handleMoveUp = async (index: number) => {
        if (index === 0) return;
        const newOrder = [...daysList];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        setDaysList(newOrder);

        const ids = newOrder.map(d => d.id);
        await reorderDays(programId, ids);
        loadProgramDetails();
        if (programId === currentProgramId) refreshProgram();
    };

    const handleMoveDown = async (index: number) => {
        if (index === daysList.length - 1) return;
        const newOrder = [...daysList];
        [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
        setDaysList(newOrder);

        const ids = newOrder.map(d => d.id);
        await reorderDays(programId, ids);
        loadProgramDetails();
        if (programId === currentProgramId) refreshProgram();
    };

    const handleDeleteProgram = () => {
        setDeleteModalVisible(true);
    };

    const confirmDeleteProgram = async () => {
        await deletePlan(programId);
        setDeleteModalVisible(false);
        onBack();
    };

    const handleAddExercise = (dayId: number) => {
        setActiveDayId(dayId);
        setPickerVisible(true);
    };

    const handleSelectExercise = async (exerciseId: number) => {
        if (activeDayId) {
            await addExerciseToDay(activeDayId, exerciseId);
            setPickerVisible(false);
            setActiveDayId(null);
            loadProgramDetails();
        }
    };

    const handleCreateExercise = () => {
        setPickerVisible(false);
        // Navigate to Exercises screen to create new exercise
        // We might need to pass a param to know we should return here, 
        // but for now let's just navigate. The user can manually come back.
        // Ideally we would have a stack navigator and push the create screen.
        // Assuming 'Exercises' is a tab, we might need a specific stack screen for creation.
        // For now, let's just navigate to the Exercises tab/screen.
        // @ts-ignore
        navigation.navigate('Exercises');
    };

    const handleEditExercise = async (exerciseId: number) => {
        const exercise = await getExerciseById(exerciseId);
        if (exercise) {
            setEditingExercise(exercise);
            setEditModalVisible(true);
        }
    };

    const handleSaveExercise = async (data: NewExercise) => {
        if (editingExercise) {
            await updateExercise(editingExercise.id, data);
            setEditModalVisible(false);
            setEditingExercise(null);
            loadProgramDetails();
        }
    };

    // const [isDaysListCollapsed, setIsDaysListCollapsed] = useState(false); // Removed duplicate

    // ... existing code ...

    return (
        <View className="flex-1">
            <ScreenHeader
                title={t('programEditor.editProgram')}
                variant="modal"
                leftAction={
                    <HeaderAction
                        label={t('common.done')}
                        onPress={onBack}
                        variant="link"
                    />
                }
            />

            <FlatList
                data={isDaysListCollapsed ? [] : daysList}
                keyExtractor={(item) => `day-${item.id}`}
                contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
                ListHeaderComponent={
                    <View className="mb-6">
                        <Text className="text-zinc-500 text-xs uppercase font-bold mb-2">{t('programEditor.programName')}</Text>
                        <TextInput
                            className="bg-zinc-900 text-zinc-50 p-4 rounded-xl border border-zinc-800 mb-4"
                            value={programName}
                            onChangeText={setProgramName}
                            onEndEditing={handleSaveMeta}
                        />
                        <Text className="text-zinc-500 text-xs uppercase font-bold mb-2">{t('common.description')}</Text>
                        <TextInput
                            className="bg-zinc-900 text-zinc-50 p-4 rounded-xl border border-zinc-800"
                            value={programDesc}
                            onChangeText={setProgramDesc}
                            onEndEditing={handleSaveMeta}
                        />
                        <View className="h-px bg-zinc-800 my-6" />

                        <TouchableOpacity
                            className="flex-row items-center justify-between mb-2"
                            onPress={() => setIsDaysListCollapsed(!isDaysListCollapsed)}
                        >
                            <Text className="text-zinc-500 text-xs uppercase font-bold">{t('programEditor.days')}</Text>
                            <View className="bg-zinc-900 p-1 rounded border border-zinc-800">
                                {isDaysListCollapsed ? (
                                    <ChevronDown size={14} color="#71717a" />
                                ) : (
                                    <ChevronUp size={14} color="#71717a" />
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                }
                renderItem={({ item, index }) => (
                    <DayCard
                        day={item}
                        exercises={daysExercises[item.id] || []}
                        onDelete={() => handleDeleteDay(item.id)}
                        onMoveUp={() => handleMoveUp(index)}
                        onMoveDown={() => handleMoveDown(index)}
                        isFirst={index === 0}
                        isLast={index === daysList.length - 1}
                        onAddExercise={() => handleAddExercise(item.id)}
                        onRefresh={loadProgramDetails}
                        onEditExercise={handleEditExercise}
                    />
                )}
                ListFooterComponent={
                    <View>
                        {!isDaysListCollapsed && (
                            <TouchableOpacity
                                className="flex-row items-center justify-center bg-blue-600/10 p-4 rounded-xl border border-blue-600/30 mt-4"
                                onPress={handleAddDay}
                            >
                                <Plus size={20} color="#3b82f6" className="mr-2" />
                                <Text className="text-blue-500 font-bold">{t('programEditor.addDay')}</Text>
                            </TouchableOpacity>
                        )}

                        <View className="mt-8">
                            <TouchableOpacity
                                className="bg-blue-600 p-4 rounded-xl items-center mb-3"
                                onPress={onBack}
                            >
                                <Text className="text-white font-bold">{t('common.save')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-red-500/10 p-4 rounded-xl items-center border border-red-500/20"
                                onPress={handleDeleteProgram}
                            >
                                <Text className="text-red-500 font-bold">{t('programSelection.deleteProgramTitle')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            />

            <ConfirmationModal
                visible={deleteModalVisible}
                title={t('programSelection.deleteProgramTitle')}
                message={t('programSelection.deleteProgramMessage')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                onConfirm={confirmDeleteProgram}
                onCancel={() => setDeleteModalVisible(false)}
                confirmButtonColor="red"
            />

            <ExercisePickerModal
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onSelect={handleSelectExercise}
                onCreateExercise={handleCreateExercise}
            />

            <ExerciseFormModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                onSave={handleSaveExercise}
                onDelete={async () => { }} // We don't want to delete exercises from here, just edit
                initialData={editingExercise}
            />
        </View>
    );
};
