import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { db } from '../db/client';
import * as schema from '../db/schema';
import { useProgram } from '../context/ProgramContext';
import { eq } from 'drizzle-orm';

type Program = {
    id: number;
    name: string;
    description: string | null;
};

export const ProgramSelectionScreen = () => {
    const navigation = useNavigation();
    const { setProgram: setContextProgram } = useProgram();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPrograms = async () => {
            try {
                const allPrograms = await db.select().from(schema.programs);
                setPrograms(allPrograms);
            } catch (error) {
                console.error('Error loading programs:', error);
                Alert.alert('Error', 'Failed to load programs');
            } finally {
                setLoading(false);
            }
        };
        loadPrograms();
    }, []);

    const handleSelectProgram = async (programId: number) => {
        try {
            await setContextProgram(programId);
            Alert.alert('Success', 'Program updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error selecting program:', error);
            Alert.alert('Error', 'Failed to update program');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950">
            <View className="px-6 py-4 border-b border-zinc-900 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <Text className="text-blue-500 font-bold text-lg">Back</Text>
                </TouchableOpacity>
                <Text className="text-zinc-50 text-xl font-bold">Select Program</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {loading ? (
                    <Text className="text-zinc-500 text-center">Loading programs...</Text>
                ) : (
                    programs.map((prog) => (
                        <TouchableOpacity
                            key={prog.id}
                            onPress={() => handleSelectProgram(prog.id)}
                            className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-4 active:bg-zinc-800"
                        >
                            <Text className="text-zinc-50 text-lg font-bold mb-1">{prog.name}</Text>
                            {prog.description && (
                                <Text className="text-zinc-400 text-sm">{prog.description}</Text>
                            )}
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};
