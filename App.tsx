import './global.css';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/i18n'; // Initialize i18n
import WelcomeScreen from './src/screens/WelcomeScreen';

export default function App() {
    return (
        <SafeAreaProvider>
            <WelcomeScreen />
        </SafeAreaProvider>
    );
}
