import { Slot, Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, ActivityIndicator } from "react-native";
import { useAppMigrations } from "../db/client.native";
import "../i18n";
import "../../global.css";

export default function RootLayout() {
    const { success, error } = useAppMigrations();

    if (error) {
        return (
            <View className="flex-1 items-center justify-center bg-zinc-950">
                <Text className="text-red-500">Migration Error: {error.message}</Text>
            </View>
        );
    }

    if (!success) {
        return (
            <View className="flex-1 items-center justify-center bg-zinc-950">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-zinc-400 mt-4">Initializing Database...</Text>
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: "#09090b", // zinc-950
                    },
                    headerTintColor: "#fafafa", // zinc-50
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                    contentStyle: {
                        backgroundColor: "#09090b",
                    },
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
        </SafeAreaProvider>
    );
}
