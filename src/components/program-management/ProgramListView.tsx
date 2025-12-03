import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ClipboardList } from 'lucide-react-native';
import { EmptyState } from '../EmptyState';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '../../db/client';
import * as schema from '../../db/schema';
import { useProgram } from '../../context/ProgramContext';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { ProgramItem } from '../../types/program-management';
import { ScreenHeader } from '../ScreenHeader';
import { HeaderAction } from '../HeaderAction';

type ProgramListViewProps = {
    onEdit: (id: number) => void;
    onCreate: () => void;
    onSelectActive: (id: number) => void;
};

export const ProgramListView = ({
    onEdit,
    onCreate,
    onSelectActive
}: ProgramListViewProps) => {
    const { t } = useTranslation();
    const { currentProgramId } = useProgram();
    const [programList, setProgramList] = useState<ProgramItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [pendingSelectionId, setPendingSelectionId] = useState<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadPrograms();
        }, []) // Empty deps - reload every time screen is focused
    );

    const loadPrograms = async () => {
        try {
            const allPrograms = await db.select().from(schema.programs);
            setProgramList(allPrograms);
        } catch (error) {
            console.error('Error loading programs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPress = (id: number) => {
        setPendingSelectionId(id);
        setModalVisible(true);
    };

    const confirmSelection = () => {
        if (pendingSelectionId) {
            onSelectActive(pendingSelectionId);
            setModalVisible(false);
            setPendingSelectionId(null);
        }
    };

    return (
        <View className="flex-1">
            <ScreenHeader
                title={t('common.programs')}
                rightAction={
                    <HeaderAction
                        label={t('programSelection.new')}
                        onPress={onCreate}
                        variant="primary"
                    />
                }
            />

            <ScrollView
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {loading ? (
                    <Text className="text-zinc-500 text-center">{t('common.loading')}</Text>
                ) : programList.length === 0 ? (
                    <EmptyState
                        icon={ClipboardList}
                        title={t('programSelection.noPrograms')}
                        message={t('programSelection.createPrompt')}
                        actionLabel={t('programSelection.new')}
                        onAction={onCreate}
                    />
                ) : (
                    programList.map((prog) => {
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
                                            onPress={() => handleSelectPress(prog.id)}
                                            className="bg-blue-500 px-5 py-3 rounded-xl mx-1"
                                        >
                                            <Text className="text-white font-bold text-sm">{t('common.select')}</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        onPress={() => onEdit(prog.id)}
                                        className="bg-transparent border border-zinc-700 px-5 py-3 rounded-xl mx-1"
                                    >
                                        <Text className="text-zinc-300 font-bold text-sm">{t('common.edit')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
                {programList.length > 0 && <View className="h-20" />}
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
        </View>
    );
};
