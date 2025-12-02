import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DebugDashboardScreen } from '../screens/DebugDashboardScreen';
import { TableListScreen } from '../screens/TableListScreen';
import { EditRecordScreen } from '../screens/EditRecordScreen';
import { ActiveExerciseScreen } from '../screens/ActiveExerciseScreen';
import { WorkoutSummaryScreen } from '../screens/WorkoutSummaryScreen';
import { LiveWorkoutProvider } from '../context/LiveWorkoutContext';

import { ProgramProvider } from '../context/ProgramContext';
import { ProgramSelectionScreen } from '../screens/ProgramSelectionScreen';
import { HomeScreen } from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
    return (
        <LiveWorkoutProvider>
            <ProgramProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="Home" id="RootStack">
                        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="DebugDashboard" component={DebugDashboardScreen} options={{ title: 'Debug Dashboard' }} />
                        <Stack.Screen name="TableList" component={TableListScreen} options={({ route }: any) => ({ title: route.params.tableName })} />
                        <Stack.Screen name="EditRecord" component={EditRecordScreen} options={({ route }: any) => ({ title: route.params.recordId ? 'Edit Record' : 'Add Record' })} />
                        <Stack.Screen name="ActiveExercise" component={ActiveExerciseScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ProgramSelection" component={ProgramSelectionScreen} options={{ headerShown: false }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </ProgramProvider>
        </LiveWorkoutProvider>
    );
};
