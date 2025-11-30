import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DebugDashboardScreen } from '../screens/DebugDashboardScreen';
import { TableListScreen } from '../screens/TableListScreen';
import { EditRecordScreen } from '../screens/EditRecordScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="DebugDashboard" id="RootStack">
                <Stack.Screen name="DebugDashboard" component={DebugDashboardScreen} options={{ title: 'Debug Dashboard' }} />
                <Stack.Screen name="TableList" component={TableListScreen} options={({ route }: any) => ({ title: route.params.tableName })} />
                <Stack.Screen name="EditRecord" component={EditRecordScreen} options={({ route }: any) => ({ title: route.params.recordId ? 'Edit Record' : 'Add Record' })} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
