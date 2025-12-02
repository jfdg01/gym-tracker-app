import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
    const navigation = useNavigation();
    const { setProgram: setContextProgram, currentProgramId } = useProgram();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const loadPrograms = async () => {
            try {
                const allPrograms = await db.select().from(schema.programs);
                setPrograms(allPrograms);
            } catch (error) {
                console.error('Error loading programs:', error);
                console.error('Error loading programs:', error);
            } finally {
                setLoading(false);
            }
        };
        loadPrograms();
    }, []);

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

    return (
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top', 'left', 'right']}>
            < View className="px-6 py-4 border-b border-zinc-900 flex-row items-center bg-zinc-950" >
                <Text className="text-zinc-50 text-3xl font-bold">Programas</Text>
            </View >

            <ScrollView className="flex-1 px-6 pt-6">
                {loading ? (
                    <Text className="text-zinc-500 text-center">Loading programs...</Text>
                ) : (
                    programs.map((prog) => {
                        const isActive = prog.id === currentProgramId;
                        return (
                            <TouchableOpacity
                                key={prog.id}
                                onPress={() => handleProgramPress(prog.id)}
                                className={`p-6 rounded-2xl border mb-4 active:bg-zinc-800 ${isActive ? 'bg-zinc-800 border-blue-500' : 'bg-zinc-900 border-zinc-800'
                                    }`}
                            >
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-zinc-50 text-xl font-bold">{prog.name}</Text>
                                    {isActive ? (
                                        <Text className="text-blue-500 font-bold text-sm">Activo</Text>
                                    ) : (
                                        <Text className="text-zinc-400 font-bold text-sm">Seleccionar</Text>
                                    )}
                                </View>
                                {prog.description && (
                                    <Text className="text-zinc-400 text-base leading-relaxed">{prog.description}</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            <ConfirmationModal
                visible={modalVisible}
                title="Cambiar Programa"
                message="¿Estás seguro de que quieres cambiar tu programa de entrenamiento actual? Esto actualizará tu rutina diaria."
                confirmText="Cambiar"
                cancelText="Cancelar"
                onConfirm={confirmSelection}
                onCancel={() => setModalVisible(false)}
                confirmButtonColor="blue"
            />
        </SafeAreaView >
    );
};
