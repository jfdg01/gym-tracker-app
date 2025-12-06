import './global.css';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/i18n'; // Initialize i18n

export default function App() {
    return (
        <SafeAreaProvider>
        </SafeAreaProvider>
    );
}
