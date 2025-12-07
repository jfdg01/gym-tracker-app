import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userService, programService } from '../../../services';

export default function ProgramSelectionScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [programs, setPrograms] = useState<any[]>([]);

    useEffect(() => {
        loadPrograms();
    }, []);

    const loadPrograms = async () => {
        try {
            const allUserPrograms = await userService.getAllUserPrograms();
            const activeUserPrograms = allUserPrograms.filter(up => up.is_active);

            const displayData = [];
            for (const up of activeUserPrograms) {
                const program = await programService.getProgramById(up.program_id);
                const days = await programService.getDaysByProgramId(up.program_id);
                days.sort((a, b) => a.order_index - b.order_index);

                let nextDayName = "Unknown";
                let nextDayId = -1;

                if (days.length > 0) {
                    if (up.last_completed_day_id) {
                        const lastIndex = days.findIndex(d => d.id === up.last_completed_day_id);
                        const nextIndex = (lastIndex + 1) % days.length;
                        nextDayName = days[nextIndex].name;
                        nextDayId = days[nextIndex].id;
                    } else {
                        nextDayName = days[0].name;
                        nextDayId = days[0].id;
                    }
                }

                displayData.push({
                    userProgram: up,
                    programName: program?.name || 'Unknown',
                    nextDayName,
                    nextDayId
                });
            }
            setPrograms(displayData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-zinc-950 items-center justify-center">
                <ActivityIndicator color="#3b82f6" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-zinc-950">
            <View className="p-6">
                <Text className="text-white text-3xl font-bold mb-6">Select Program</Text>

                {programs.length === 0 ? (
                    <Text className="text-zinc-500">No active programs found.</Text>
                ) : (
                    <View className="gap-4">
                        {programs.map((p, i) => (
                            <TouchableOpacity
                                key={i}
                                className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
                                onPress={() => {
                                    if (p.nextDayId !== -1) {
                                        router.push(`/workout/session?programId=${p.userProgram.program_id}&dayId=${p.nextDayId}`);
                                    }
                                }}
                            >
                                <Text className="text-white text-xl font-bold mb-1">{p.programName}</Text>
                                <Text className="text-zinc-400">Next: <Text className="text-blue-400 font-semibold">{p.nextDayName}</Text></Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
