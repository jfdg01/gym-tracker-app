import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createPlan, deletePlan } from '../db/plans';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { db } from '../db/client';
import * as schema from '../db/schema';
import { useProgram } from '../context/ProgramContext';
import { eq } from 'drizzle-orm';
import { ConfirmationModal } from '../components/ConfirmationModal';

type Program = {
    id: number;
    name: string;
    description: string | null;
};

export const ProgramSelectionScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { setProgram: setContextProgram, currentProgramId } = useProgram();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadPrograms();
        });
        return unsubscribe;
    }, [navigation]);

    const loadPrograms = async () => {
        try {
            const allPrograms = await db.select().from(schema.programs);
            setPrograms(allPrograms);
        } catch (error) {
            console.error('Error loading programs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProgramPress = (programId: number) => {
        setSelectedProgramId(programId);
        setModalVisible(true);
    };

    const confirmSelection = async () => {
        if (selectedProgramId === null) return;

        try {
            await setContextProgram(selectedProgramId);
            setModalVisible(false);
        } catch (error) {
            console.error('Error selecting program:', error);
        }
    };

    const handleCreateProgram = async () => {
        const newId = await createPlan("New Program", "Description");
        (navigation as any).navigate('ProgramEditor', { programId: newId });
    };

    const handleEditProgram = (programId: number) => {
        (navigation as any).navigate('ProgramEditor', { programId });
    };

    const handleDeleteProgram = (programId: number) => {
        Alert.alert(
            t('programSelection.deleteProgramTitle'),
            t('programSelection.deleteProgramMessage'),
            [
                { text: t('common.cancel'), style: "cancel" },
                {
                    text: t('common.delete'),
                    style: "destructive",
                    onPress: async () => {
                        await deletePlan(programId);
                        loadPrograms();
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top', 'left', 'right', 'bottom']}>
            <View className="px-6 py-4 border-b border-zinc-900 flex-row items-center justify-between bg-zinc-950">
                <Text className="text-zinc-50 text-3xl font-bold">{t('common.programs')}</Text>
                <TouchableOpacity onPress={handleCreateProgram} className="bg-blue-500 px-5 py-3 rounded-xl">
                    <Text className="text-white font-bold">{t('programSelection.new')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {loading ? (
                    <Text className="text-zinc-500 text-center">{t('common.loading')}</Text>
                ) : (
                    programs.map((prog) => {
                        const isActive = prog.id === currentProgramId;
                        return (
                            <View
                                key={prog.id}
                                className={`p-6 rounded-2xl border mb-4 shadow-sm ${isActive ? 'bg-zinc-800 border-blue-500' : 'bg-zinc-900 border-zinc-800'}`}
                            >
                                <View>
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-zinc-50 text-xl font-semibold">{prog.name}</Text>
                                        {isActive && (
                                            <Text className="text-blue-500 font-semibold text-sm">{t('programSelection.active')}</Text>
                                        )}
                                    </View>
                                    {prog.description && (
                                        <Text className="text-zinc-400 text-base leading-relaxed mb-4">{prog.description}</Text>
                                    )}
                                </View>

                                <View className="flex-row justify-end space-x-3 border-t border-zinc-700/50 pt-4 mt-2">
                                    {!isActive && (
                                        <TouchableOpacity
                                            onPress={() => handleProgramPress(prog.id)}
                                            className="bg-blue-500 px-5 py-3 rounded-xl mx-1"
                                        >
                                            <Text className="text-white font-bold text-sm">{t('common.select')}</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        onPress={() => handleEditProgram(prog.id)}
                                        className="bg-transparent border border-zinc-700 px-5 py-3 rounded-xl mx-1"
                                    >
                                        <Text className="text-zinc-300 font-bold text-sm">{t('common.edit')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteProgram(prog.id)}
                                        className="bg-red-500/10 px-5 py-3 rounded-xl mx-1"
                                    >
                                        <Text className="text-red-500 font-bold text-sm">{t('common.delete')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
                <View className="h-20" />
            </ScrollView>

            <ConfirmationModal
                visible={modalVisible}
                title={t('programSelection.changeProgramTitle')}
                message={t('programSelection.changeProgramMessage')}
                confirmText={t('programSelection.switch')}
                cancelText={t('common.cancel')}
                onConfirm={confirmSelection}
                onCancel={() => setModalVisible(false)}
                confirmButtonColor="blue"
            />
        </SafeAreaView>
    );
};
