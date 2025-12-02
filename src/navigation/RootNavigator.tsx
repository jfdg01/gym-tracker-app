import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ActiveExerciseScreen } from '../screens/ActiveExerciseScreen';
import { WorkoutSummaryScreen } from '../screens/WorkoutSummaryScreen';
import { LiveWorkoutProvider } from '../context/LiveWorkoutContext';

import { ProgramProvider } from '../context/ProgramContext';
import { TabNavigator } from './TabNavigator';
import { ProgramEditorScreen } from '../screens/ProgramEditorScreen';
import { DayEditorScreen } from '../screens/DayEditorScreen';
import { ExercisePickerScreen } from '../screens/ExercisePickerScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
    return (
        <LiveWorkoutProvider>
            <ProgramProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="Tabs" id="RootStack">
                        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
                        <Stack.Screen name="ActiveExercise" component={ActiveExerciseScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ProgramEditor" component={ProgramEditorScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="DayEditor" component={DayEditorScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} options={{ headerShown: false, presentation: 'modal' }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </ProgramProvider>
        </LiveWorkoutProvider>
    );
};
