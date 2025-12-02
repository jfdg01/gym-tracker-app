import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ExercisesScreen = () => {
    return (
        <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center">
            <View className="p-6 items-center">
                <Text className="text-blue-500 text-6xl mb-4">🏋️</Text>
                <Text className="text-zinc-50 text-2xl font-bold mb-2">Ejercicios</Text>
                <Text className="text-zinc-400 text-center">
                    Próximamente podrás gestionar tu biblioteca de ejercicios aquí.
                </Text>
            </View>
        </SafeAreaView>
    );
};
