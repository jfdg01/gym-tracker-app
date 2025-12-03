import React, { createContext, useState, useContext, useEffect } from 'react';

// Types
export type Set = {
    id: string;
    targetReps: number;
    targetWeight: number;
    actualReps?: number;
    actualValue?: string; // For text/time based exercises
    completed: boolean;
};

export type Exercise = {
    id: string;
    name: string;
    description?: string | null;
    track_type?: 'reps' | 'time';
    resistance_type?: 'weight' | 'text';
    sets: Set[];
    restTimeSeconds: number;
    minReps: number;
    maxReps: number;
    weight?: number | null;
    timeDuration?: number;
    currentValText?: string;
    increaseRate?: number;
    decreaseRate?: number;
    timeIncreaseStep?: number;
    maxTimeCap?: number;
    nextSessionWeightAdjustment?: number; // dynamic based on increaseRate/decreaseRate
    nextSessionTimeAdjustment?: number; // dynamic based on timeIncreaseStep
};

export type WorkoutSession = {
    exercises: Exercise[];
    startTime: Date;
    endTime?: Date;
    completed: boolean;
};

type LiveWorkoutContextType = {
    workout: WorkoutSession | null;
    currentExerciseIndex: number;
    currentSetIndex: number;
    isResting: boolean;
    restTimer: number;
    startWorkout: (exercises: Exercise[]) => void;
    completeSet: (val: number | string) => void;
    skipExercise: () => void;
    goToExercise: (index: number) => void;
    finishWorkout: () => void;
    cancelRest: () => void;
};

const LiveWorkoutContext = createContext<LiveWorkoutContextType | undefined>(undefined);

export const useLiveWorkout = () => {
    const context = useContext(LiveWorkoutContext);
    if (!context) {
        throw new Error('useLiveWorkout must be used within a LiveWorkoutProvider');
    }
    return context;
};

export const LiveWorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [workout, setWorkout] = useState<WorkoutSession | null>(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [restTimer, setRestTimer] = useState(0);

    const startWorkout = (exercises: Exercise[]) => {
        const newWorkout: WorkoutSession = {
            startTime: new Date(),
            completed: false,
            exercises: JSON.parse(JSON.stringify(exercises)), // Deep copy to reset
        };
        setWorkout(newWorkout);
        setCurrentExerciseIndex(0);
        setCurrentSetIndex(0);
        setIsResting(false);
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isResting && restTimer > 0) {
            interval = setInterval(() => {
                setRestTimer((prev) => prev - 1);
            }, 1000);
        } else if (isResting && restTimer === 0) {
            setIsResting(false);
            // Play alarm sound here (mocked)
            console.log('Alarm! Set finished.');
        }
        return () => clearInterval(interval);
    }, [isResting, restTimer]);

    const completeSet = (val: number | string) => {
        if (!workout) return;

        const updatedWorkout = { ...workout };
        const updatedExercises = [...updatedWorkout.exercises];
        const currentExercise = updatedExercises[currentExerciseIndex];
        const currentSet = currentExercise.sets[currentSetIndex];

        if (typeof val === 'number') {
            currentSet.actualReps = val;
            currentSet.actualValue = val.toString();
        } else {
            currentSet.actualValue = val;
            // For text based, actualReps might be undefined or 0
        }

        currentSet.completed = true;

        // Check if it was the last set of the exercise
        const isLastSetOfExercise = currentSetIndex === currentExercise.sets.length - 1;

        if (isLastSetOfExercise) {
            // Progressive Overload Logic
            const trackType = currentExercise.track_type || 'reps';
            const resistanceType = currentExercise.resistance_type || 'weight';

            // 1. Check if progression criteria met (Trigger)
            let criteriaMet = false;

            if (trackType === 'time') {
                // Check if all sets met the target time
                criteriaMet = currentExercise.sets.every(s => {
                    const val = parseFloat(s.actualValue || '0');
                    return val >= (currentExercise.timeDuration || 0);
                });
            } else {
                // Reps based
                const valNum = typeof val === 'number' ? val : parseFloat(val);
                criteriaMet = valNum >= currentExercise.maxReps;
            }

            // 2. Apply Progression (Resistance Increase)
            if (criteriaMet) {
                if (trackType === 'time') {
                    // For time tracking, we might increase time OR weight/text depending on resistance type?
                    // Actually, if resistance is weight, we increase weight. If resistance is text, we do nothing (manual).
                    // But wait, for Planks (Time + Text), we usually increase Time until a cap, then change Text (Form).
                    // For Weighted Planks (Time + Weight), we increase Time until cap, then Weight? Or just Weight?
                    // The user said: "for planks we need time and text, since we stay for as long as possible and when we reach a certain amount of s we change the form"
                    // So for Time-based, we primarily increase TIME.

                    const step = currentExercise.timeIncreaseStep || 5;
                    const cap = currentExercise.maxTimeCap || 120;
                    const currentDuration = currentExercise.timeDuration || 0;

                    if (currentDuration < cap) {
                        let nextDuration = currentDuration + step;
                        if (nextDuration > cap) nextDuration = cap;
                        currentExercise.nextSessionTimeAdjustment = nextDuration - currentDuration;
                    } else {
                        // Reached cap. If resistance is weight, maybe increase weight?
                        // For now, let's keep it simple: Time exercises increase Time.
                        currentExercise.nextSessionTimeAdjustment = 0;
                    }
                } else {
                    // Reps based
                    if (resistanceType === 'weight') {
                        currentExercise.nextSessionWeightAdjustment = currentExercise.increaseRate ?? 2.5;
                    }
                }
            } else {
                // Criteria NOT met (Deload logic?)
                if (trackType === 'reps' && resistanceType === 'weight') {
                    const valNum = typeof val === 'number' ? val : parseFloat(val);
                    if (valNum < currentExercise.minReps) {
                        currentExercise.nextSessionWeightAdjustment = -(currentExercise.decreaseRate ?? 5.0);
                    }
                }
            }

            // Move to next exercise or finish
            if (currentExerciseIndex < updatedExercises.length - 1) {
                setCurrentExerciseIndex((prev) => prev + 1);
                setCurrentSetIndex(0);
                setIsResting(true);
                setRestTimer(currentExercise.restTimeSeconds);
                setWorkout(updatedWorkout);
            } else {
                const finalWorkout = { ...updatedWorkout, completed: true, endTime: new Date() };
                setWorkout(finalWorkout);
            }
        } else {
            // Move to next set
            setCurrentSetIndex((prev) => prev + 1);
            setIsResting(true);
            setRestTimer(currentExercise.restTimeSeconds);
            setWorkout(updatedWorkout);
        }
    };

    const skipExercise = () => {
        if (!workout) return;
        if (currentExerciseIndex < workout.exercises.length - 1) {
            setCurrentExerciseIndex((prev) => prev + 1);
            setCurrentSetIndex(0);
            setIsResting(false);
        } else {
            finishWorkout();
        }
    };

    const goToExercise = (index: number) => {
        if (!workout || index < 0 || index >= workout.exercises.length) return;
        setCurrentExerciseIndex(index);
        // Find first incomplete set or default to 0
        const firstIncompleteSetIdx = workout.exercises[index].sets.findIndex(s => !s.completed);
        setCurrentSetIndex(firstIncompleteSetIdx !== -1 ? firstIncompleteSetIdx : 0);
        setIsResting(false);
        setRestTimer(0);
    };

    const finishWorkout = () => {
        if (!workout) return;

        setWorkout((prev) => {
            if (!prev) return null;
            return { ...prev, completed: true, endTime: new Date() };
        });
    };

    const cancelRest = () => {
        setIsResting(false);
        setRestTimer(0);
    };

    return (
        <LiveWorkoutContext.Provider
            value={{
                workout,
                currentExerciseIndex,
                currentSetIndex,
                isResting,
                restTimer,
                startWorkout,
                completeSet,
                skipExercise,
                goToExercise,
                finishWorkout,
                cancelRest,
            }}
        >
            {children}
        </LiveWorkoutContext.Provider>
    );
};
