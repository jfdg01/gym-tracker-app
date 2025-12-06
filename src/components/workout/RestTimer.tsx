import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLiveWorkoutStore } from '../../stores/useLiveWorkoutStore';
import { RestTimerProps } from '../../types/workout';

export const RestTimer: React.FC<RestTimerProps> = ({ onAddSeconds, onSkip }) => {
    const { t } = useTranslation();
    const { timerSecondsRemaining, timerDuration, tickTimer, isTimerRunning } = useLiveWorkoutStore();

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                tickTimer();
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, tickTimer]);

    if (!isTimerRunning) return null;

    const progress = timerDuration > 0 ? timerSecondsRemaining / timerDuration : 0;
    const minutes = Math.floor(timerSecondsRemaining / 60);
    const seconds = timerSecondsRemaining % 60;

    return (
        <View className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-6 pb-10 shadow-2xl">
            <View className="flex-row items-center justify-between">
                <View>
                    <Text className="text-zinc-400 text-xs uppercase font-bold mb-1">{t('workout.rest_timer')}</Text>
                    <Text className="text-4xl font-bold text-blue-500 font-monospaced">
                        {minutes}:{seconds.toString().padStart(2, '0')}
                    </Text>
                </View>

                <View className="flex-row space-x-4">
                    <TouchableOpacity
                        onPress={() => onAddSeconds(30)}
                        className="bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-700"
                    >
                        <Text className="text-white font-bold">+30s</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onSkip}
                        className="bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20 flex-row items-center space-x-2"
                    >
                        <Ionicons name="stop" size={16} color="#ef4444" />
                        <Text className="text-red-500 font-bold">{t('common.skip')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Progress Bar */}
            <View className="h-1 bg-zinc-800 mt-4 rounded-full overflow-hidden">
                <View
                    className="h-full bg-blue-500"
                    style={{ width: `${progress * 100}%` }}
                />
            </View>
        </View>
    );
};
