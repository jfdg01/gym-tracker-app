import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
    className?: string;
}

export const Layout = ({ children, className = '' }: LayoutProps) => {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className={`flex-1 px-4 ${className}`}>
                {children}
            </View>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
};
