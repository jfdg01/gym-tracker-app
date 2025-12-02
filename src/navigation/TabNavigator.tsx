import React from 'react';
import { useTranslation } from 'react-i18next';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ProgramSelectionScreen } from '../screens/ProgramSelectionScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

import { Home, ClipboardList, Dumbbell } from 'lucide-react-native';

const TabIcon = ({ name, focused, color }: { name: string; focused: boolean; color: string }) => {
    switch (name) {
        case 'Home':
            return <Home size={24} color={color} />;
        case 'Programs':
            return <ClipboardList size={24} color={color} />;
        case 'Exercises':
            return <Dumbbell size={24} color={color} />;
        default:
            return null;
    }
};

export const TabNavigator = () => {
    const { t } = useTranslation();

    return (
        <Tab.Navigator
            id="TabNavigator"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#09090b', // Zinc-950
                    borderTopColor: '#27272a', // Zinc-800
                    height: 120,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#3b82f6', // Blue-500
                tabBarInactiveTintColor: '#71717a', // Zinc-500
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: 4,
                },
                tabBarIcon: ({ focused, color }) => (
                    <TabIcon name={route.name} focused={focused} color={color} />
                ),
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: t('navigation.home') }}
            />
            <Tab.Screen
                name="Programs"
                component={ProgramSelectionScreen}
                options={{ title: t('navigation.programs') }}
            />
            <Tab.Screen
                name="Exercises"
                component={ExercisesScreen}
                options={{ title: t('navigation.exercises') }}
            />
        </Tab.Navigator>
    );
};
