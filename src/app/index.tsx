import { View, Text, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";

export default function HomeScreen() {
    return (
        <View className="flex-1 bg-zinc-950 p-6 items-center justify-center">
            <Text className="text-3xl font-bold text-white mb-2">Gym Tracker</Text>
            <Text className="text-zinc-400 mb-8">Console Logic Integrated</Text>

            <View className="w-full space-y-4 gap-4">
                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-xl items-center"
                    onPress={() => router.push('/program/select')}
                >
                    <Text className="text-white font-bold text-lg">Start Workout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-zinc-800 p-4 rounded-xl items-center"
                    onPress={() => router.push('/program/select')}
                >
                    <Text className="text-zinc-300 font-semibold text-lg">Programs</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-zinc-800 p-4 rounded-xl items-center"
                    onPress={() => console.log('Debug')}
                >
                    <Text className="text-zinc-300 font-semibold">Debug Info</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
