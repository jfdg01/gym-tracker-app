import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../db/client';
import { programs, days } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { addDayToPlan, deleteDay, reorderDays, updatePlan } from '../db/plans';
import { useProgram } from '../context/ProgramContext';

type DayItem = typeof days.$inferSelect;

export const ProgramEditorScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute();
    const { programId } = route.params as { programId: number };
    const { currentProgramId, refreshProgram } = useProgram();

    const [programName, setProgramName] = useState('');
    const [programDesc, setProgramDesc] = useState('');
    const [daysList, setDaysList] = useState<DayItem[]>([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadProgramDetails();
        });
        return unsubscribe;
    }, [navigation]);

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
        (navigation as any).navigate('DayEditor', { dayId: newDayId });
    };

    const handleEditDay = (dayId: number) => {
        (navigation as any).navigate('DayEditor', { dayId });
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

    return (
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top', 'left', 'right', 'bottom']}>
            <View className="px-4 py-2 border-b border-zinc-900 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-blue-500 text-lg">{t('common.done')}</Text>
                </TouchableOpacity>
                <Text className="text-zinc-50 text-xl font-bold">{t('programEditor.editProgram')}</Text>
                <View className="w-10" />
            </View>

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
                                <TouchableOpacity onPress={() => handleEditDay(item.id)} className="bg-blue-900/30 px-3 py-1 rounded mr-2">
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
                    <TouchableOpacity
                        className="bg-blue-600 p-4 rounded-xl items-center mt-4"
                        onPress={handleAddDay}
                    >
                        <Text className="text-white font-bold">{t('programEditor.addDay')}</Text>
                    </TouchableOpacity>
                }
            />
        </SafeAreaView>
    );
};
