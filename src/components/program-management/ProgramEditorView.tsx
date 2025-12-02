import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { db } from '../../db/client';
import * as schema from '../../db/schema';
import { programs, days } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import { updatePlan, addDayToPlan, deleteDay, reorderDays, deletePlan } from '../../db/plans';
import { useProgram } from '../../context/ProgramContext';
import { DayItem } from '../../types/program-management';
import { ScreenHeader } from '../ScreenHeader';
import { HeaderAction } from '../HeaderAction';
import { ConfirmationModal } from '../ConfirmationModal';

type ProgramEditorViewProps = {
    programId: number;
    onBack: () => void;
    onEditDay: (dayId: number) => void;
};

export const ProgramEditorView = ({
    programId,
    onBack,
    onEditDay
}: ProgramEditorViewProps) => {
    const { t } = useTranslation();
    const { currentProgramId, refreshProgram } = useProgram();
    const [programName, setProgramName] = useState('');
    const [programDesc, setProgramDesc] = useState('');
    const [daysList, setDaysList] = useState<DayItem[]>([]);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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
    };

    const handleSaveMeta = async () => {
        await updatePlan(programId, { name: programName, description: programDesc });
        if (programId === currentProgramId) refreshProgram();
    };

    const handleAddDay = async () => {
        const newDayId = await addDayToPlan(programId, `Day ${daysList.length + 1}`);
        if (programId === currentProgramId) refreshProgram();
        onEditDay(newDayId);
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

            <View className="p-4 border-b border-zinc-900">
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
            </View>

            <FlatList
                data={daysList}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                ListHeaderComponent={
                    <Text className="text-zinc-500 text-xs uppercase font-bold mb-4">{t('programEditor.days')}</Text>
                }
                renderItem={({ item, index }) => (
                    <View className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-3">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-zinc-50 font-bold text-lg">{item.name}</Text>
                            <View className="flex-row space-x-2">
                                <TouchableOpacity onPress={() => onEditDay(item.id)} className="bg-blue-900/30 px-3 py-1 rounded mr-2">
                                    <Text className="text-blue-400 text-xs font-bold">{t('common.edit')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteDay(item.id)} className="bg-red-900/30 px-3 py-1 rounded">
                                    <Text className="text-red-400 text-xs font-bold">{t('common.delete')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="flex-row justify-between items-center">
                            <Text className="text-zinc-500 text-xs">{item.is_rest_day ? t('common.restDay') : t('programEditor.workoutDay')}</Text>
                            <View className="flex-row space-x-2">
                                <TouchableOpacity
                                    onPress={() => handleMoveUp(index)}
                                    disabled={index === 0}
                                    className={`p-2 rounded ${index === 0 ? 'opacity-30' : 'bg-zinc-800'}`}
                                >
                                    <Text className="text-zinc-400 font-bold">↑</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleMoveDown(index)}
                                    disabled={index === daysList.length - 1}
                                    className={`p-2 rounded ${index === daysList.length - 1 ? 'opacity-30' : 'bg-zinc-800'}`}
                                >
                                    <Text className="text-zinc-400 font-bold">↓</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
                ListFooterComponent={
                    <View>
                        <TouchableOpacity
                            className="bg-blue-600 p-4 rounded-xl items-center mt-4"
                            onPress={handleAddDay}
                        >
                            <Text className="text-white font-bold">{t('programEditor.addDay')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-red-500/10 p-4 rounded-xl items-center mt-4 border border-red-500/20"
                            onPress={handleDeleteProgram}
                        >
                            <Text className="text-red-500 font-bold">{t('programSelection.deleteProgramTitle')}</Text>
                        </TouchableOpacity>
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
        </View>
    );
};
