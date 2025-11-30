import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from './TabNavigator';
import { RootStackParamList } from './types';
import { CreateExerciseScreen } from '../screens/CreateExerciseScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="CreateExercise" component={CreateExerciseScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
