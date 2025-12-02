import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createPlan } from '../db/plans';
import { useProgram } from '../context/ProgramContext';
import { ViewState } from '../types/program-management';
import { ProgramListView } from '../components/program-management/ProgramListView';
import { ProgramEditorView } from '../components/program-management/ProgramEditorView';


export const ProgramManagementScreen = () => {
    const { setProgram: setContextProgram } = useProgram();
    const [view, setView] = useState<ViewState>('LIST');
    const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);

    const handleCreateProgram = async () => {
        const newId = await createPlan("New Program", "Description");
        setSelectedProgramId(newId);
        setView('PROGRAM_EDIT');
    };

    const handleEditProgram = (id: number) => {
        setSelectedProgramId(id);
        setView('PROGRAM_EDIT');
    };

    const handleSelectActiveProgram = async (id: number) => {
        await setContextProgram(id);
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top', 'left', 'right']}>
            {view === 'LIST' && (
                <ProgramListView
                    onCreate={handleCreateProgram}
                    onEdit={handleEditProgram}
                    onSelectActive={handleSelectActiveProgram}
                />
            )}
            {view === 'PROGRAM_EDIT' && selectedProgramId && (
                <ProgramEditorView
                    programId={selectedProgramId}
                    onBack={() => setView('LIST')}
                />
            )}
        </SafeAreaView>
    );
};
