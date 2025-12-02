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
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
            <View className={`flex-1 ${className}`}>
                {children}
            </View>
            <StatusBar style="light" />
        </SafeAreaView>
    );
};
