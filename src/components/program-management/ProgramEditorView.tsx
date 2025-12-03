import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, ChevronUp, ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { db } from '../../db/client';
import { programs, days, day_exercises, exercises } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import { updatePlan, addDayToPlan, deleteDay, reorderDays, deletePlan, addExerciseToDay, updateDay } from '../../db/plans';
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

    // Delete Day State
    const [deleteDayModalVisible, setDeleteDayModalVisible] = useState(false);
    const [dayToDeleteId, setDayToDeleteId] = useState<number | null>(null);
    const [dayToDeleteName, setDayToDeleteName] = useState<string>('');

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

    const handleDeleteDay = (dayId: number, dayName: string) => {
        setDayToDeleteId(dayId);
        setDayToDeleteName(dayName);
        setDeleteDayModalVisible(true);
    };

    const confirmDeleteDay = async () => {
        if (dayToDeleteId) {
            await deleteDay(dayToDeleteId);
            loadProgramDetails();
            if (programId === currentProgramId) refreshProgram();
            setDeleteDayModalVisible(false);
            setDayToDeleteId(null);
        }
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



    const handleDayChange = (dayId: number, updates: Partial<DayItem>) => {
        setDaysList(prev => prev.map(d => d.id === dayId ? { ...d, ...updates } : d));
    };

    const handleDaySave = async (dayId: number, overrides?: Partial<DayItem>) => {
        const day = daysList.find(d => d.id === dayId);
        if (day) {
            await updateDay(day.id, {
                name: day.name,
                is_rest_day: day.is_rest_day,
                ...overrides
            });
        }
    };

    const handleRefresh = async () => {
        // Save local changes before reloading to prevent overwriting with old DB data
        await Promise.all(daysList.map(d =>
            updateDay(d.id, { name: d.name, is_rest_day: d.is_rest_day })
        ));
        await loadProgramDetails();
    };

    const handleSaveAndExit = async () => {
        await handleSaveMeta();
        // Save all days to ensure consistency
        await Promise.all(daysList.map(d =>
            updateDay(d.id, { name: d.name, is_rest_day: d.is_rest_day })
        ));
        onBack();
    };

    // ... existing code ...

    return (
        <View className="flex-1">
            <ScreenHeader
                title={t('programEditor.editProgram')}
                variant="modal"
                leftAction={
                    <HeaderAction
                        label={t('common.done')}
                        onPress={handleSaveAndExit}
                        variant="link"
                    />
                }
            />

            <FlatList
                data={isDaysListCollapsed ? [] : daysList}
                keyExtractor={(item) => `day-${item.id}`}
                contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 100 }}
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
                            <View className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800 flex-row items-center">
                                <Text className="text-zinc-500 text-[10px] mr-1 font-medium">
                                    {isDaysListCollapsed ? t('common.expand') : t('common.collapse')}
                                </Text>
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
                        onDelete={() => handleDeleteDay(item.id, item.name)}
                        onMoveUp={() => handleMoveUp(index)}
                        onMoveDown={() => handleMoveDown(index)}
                        isFirst={index === 0}
                        isLast={index === daysList.length - 1}
                        onAddExercise={() => handleAddExercise(item.id)}
                        onRefresh={handleRefresh}
                        onEditExercise={handleEditExercise}
                        onUpdate={(updates) => handleDayChange(item.id, updates)}
                        onSave={() => handleDaySave(item.id)}
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
                                onPress={handleSaveAndExit}
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

            <ConfirmationModal
                visible={deleteDayModalVisible}
                title={t('programEditor.deleteDayTitle')}
                message={t('programEditor.deleteDayMessage', { name: dayToDeleteName })}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                onConfirm={confirmDeleteDay}
                onCancel={() => setDeleteDayModalVisible(false)}
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
