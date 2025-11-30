import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from './TabNavigator';
import { RootStackParamList } from './types';
import { ExerciseFormScreen } from '../screens/ExerciseFormScreen';
import { ExerciseDetailsScreen } from '../screens/ExerciseDetailsScreen';
import { ProgramBuilderScreen } from '../screens/ProgramBuilderScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="ExerciseForm" component={ExerciseFormScreen} />
                <Stack.Screen name="ExerciseDetails" component={ExerciseDetailsScreen} />
                <Stack.Screen name="ProgramBuilder" component={ProgramBuilderScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
