import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Layout } from '../components/Layout';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const HomeScreen = () => {
    const navigation = useNavigation();

    // Mock Data
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const greeting = "Good Morning, Alex"; // Dynamic based on time in real app

    const todaysWorkout = {
        name: "Push Day - Hypertrophy",
        duration: "45 min",
        exercises: 6,
        completed: false,
    };

    const recentActivity = [
        { id: 1, name: "Pull Day", date: "Yesterday", status: "Completed", color: "text-emerald-500" },
        { id: 2, name: "Legs", date: "2 days ago", status: "Completed", color: "text-emerald-500" },
        { id: 3, name: "Rest Day", date: "3 days ago", status: "-", color: "text-zinc-500" },
    ];

    return (
        <Layout>
            <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View className="px-6 pt-6 pb-8">
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-textMuted text-sm font-medium uppercase tracking-wider">{today}</Text>
                            <Text className="text-3xl font-bold text-textMain mt-1">{greeting}</Text>
                        </View>
                        <TouchableOpacity className="bg-surfaceHighlight p-3 rounded-full border border-zinc-700">
                            <Ionicons name="notifications-outline" size={24} color="#fafafa" />
                        </TouchableOpacity>
                    </View>

                    {/* Today's Status Card */}
                    <View className="bg-surface p-6 rounded-3xl border border-surfaceHighlight shadow-lg shadow-black/50">
                        <View className="flex-row justify-between items-start mb-6">
                            <View>
                                <Text className="text-blue-400 font-bold text-sm mb-2 uppercase tracking-wide">Today's Workout</Text>
                                <Text className="text-2xl font-bold text-textMain leading-tight">{todaysWorkout.name}</Text>
                            </View>
                            <View className="bg-blue-500/20 p-3 rounded-full">
                                <Ionicons name="barbell" size={24} color="#3b82f6" />
                            </View>
                        </View>

                        <View className="flex-row space-x-6 mb-8">
                            <View className="flex-row items-center space-x-2">
                                <Ionicons name="time-outline" size={20} color="#a1a1aa" />
                                <Text className="text-textMuted font-medium text-base">{todaysWorkout.duration}</Text>
                            </View>
                            <View className="flex-row items-center space-x-2">
                                <Ionicons name="layers-outline" size={20} color="#a1a1aa" />
                                <Text className="text-textMuted font-medium text-base">{todaysWorkout.exercises} Exercises</Text>
                            </View>
                        </View>

                        <TouchableOpacity className="bg-primary w-full py-4 rounded-2xl flex-row justify-center items-center space-x-2 active:opacity-90">
                            <Text className="text-white font-bold text-lg">Start Workout</Text>
                            <Ionicons name="play" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="px-6 mb-10">
                    <Text className="text-xl font-bold text-textMain mb-5">Quick Actions</Text>
                    <View className="flex-row justify-between space-x-4">
                        <TouchableOpacity className="flex-1 bg-surfaceHighlight p-5 rounded-2xl items-center border border-zinc-700 active:bg-zinc-700">
                            <Ionicons name="scale-outline" size={26} color="#a1a1aa" className="mb-3" />
                            <Text className="text-textMain font-medium text-sm">Log Weight</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 bg-surfaceHighlight p-5 rounded-2xl items-center border border-zinc-700 active:bg-zinc-700">
                            <Ionicons name="add-circle-outline" size={26} color="#a1a1aa" className="mb-3" />
                            <Text className="text-textMain font-medium text-sm">Quick Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 bg-surfaceHighlight p-5 rounded-2xl items-center border border-zinc-700 active:bg-zinc-700">
                            <Ionicons name="calendar-outline" size={26} color="#a1a1aa" className="mb-3" />
                            <Text className="text-textMain font-medium text-sm">Schedule</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Activity */}
                <View className="px-6 pb-24">
                    <View className="flex-row justify-between items-center mb-5">
                        <Text className="text-xl font-bold text-textMain">Recent Activity</Text>
                        <TouchableOpacity>
                            <Text className="text-blue-400 font-medium text-base">See All</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="bg-surface rounded-3xl border border-surfaceHighlight overflow-hidden">
                        {recentActivity.map((activity, index) => (
                            <View key={activity.id} className={`flex-row justify-between items-center p-5 ${index !== recentActivity.length - 1 ? 'border-b border-surfaceHighlight' : ''}`}>
                                <View className="flex-row items-center space-x-4">
                                    <View className="bg-surfaceHighlight p-2 rounded-full">
                                        <Ionicons name="checkmark-circle" size={22} color={activity.status === 'Completed' ? '#10b981' : '#52525b'} />
                                    </View>
                                    <View>
                                        <Text className="text-textMain font-bold text-base">{activity.name}</Text>
                                        <Text className="text-textMuted text-sm">{activity.date}</Text>
                                    </View>
                                </View>
                                <Text className={`font-medium text-sm ${activity.color}`}>{activity.status}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </Layout>
    );
};
