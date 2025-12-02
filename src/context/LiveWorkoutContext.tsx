import React, { createContext, useState, useContext, useEffect } from 'react';

// Types
export type Set = {
    id: string;
    targetReps: number;
    targetWeight: number;
    actualReps?: number;
    completed: boolean;
};

export type Exercise = {
    id: string;
    name: string;
    sets: Set[];
    restTimeSeconds: number;
    nextSessionWeightAdjustment?: number; // +2.5, -5, 0
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
    startWorkout: () => void;
    completeSet: (reps: number) => void;
    skipExercise: () => void;
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

    // Mock Data
    const mockWorkout: WorkoutSession = {
        startTime: new Date(),
        completed: false,
        exercises: [
            {
                id: '1',
                name: 'Squats',
                restTimeSeconds: 5,
                sets: [
                    { id: 's1', targetReps: 10, targetWeight: 100, completed: false },
                    { id: 's2', targetReps: 10, targetWeight: 100, completed: false },
                ],
            },
            {
                id: '2',
                name: 'Bench Press',
                restTimeSeconds: 5,
                sets: [
                    { id: 'b1', targetReps: 8, targetWeight: 80, completed: false },
                    { id: 'b2', targetReps: 8, targetWeight: 80, completed: false },
                ],
            },
            {
                id: '3',
                name: 'Deadlift',
                restTimeSeconds: 5,
                sets: [
                    { id: 'd1', targetReps: 5, targetWeight: 120, completed: false },
                    { id: 'd2', targetReps: 5, targetWeight: 120, completed: false },
                ],
            },
        ],
    };

    const startWorkout = () => {
        setWorkout(JSON.parse(JSON.stringify(mockWorkout))); // Deep copy to reset
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

    const completeSet = (reps: number) => {
        if (!workout) return;

        const updatedWorkout = { ...workout };
        const updatedExercises = [...updatedWorkout.exercises];
        const currentExercise = updatedExercises[currentExerciseIndex];
        const currentSet = currentExercise.sets[currentSetIndex];

        currentSet.actualReps = reps;
        currentSet.completed = true;

        // Check if it was the last set of the exercise
        const isLastSetOfExercise = currentSetIndex === currentExercise.sets.length - 1;

        if (isLastSetOfExercise) {
            // Progressive Overload Logic
            if (reps > 11) {
                currentExercise.nextSessionWeightAdjustment = 2.5; // Arbitrary increase
            } else if (reps < 4) {
                currentExercise.nextSessionWeightAdjustment = -5;
            } else {
                currentExercise.nextSessionWeightAdjustment = 0;
            }

            // Move to next exercise or finish
            if (currentExerciseIndex < updatedExercises.length - 1) {
                setCurrentExerciseIndex((prev) => prev + 1);
                setCurrentSetIndex(0);
                setIsResting(true);
                setRestTimer(currentExercise.restTimeSeconds);
                setWorkout(updatedWorkout);
            } else {
                // IMPORTANT: If it's the last exercise, we must mark it as completed immediately
                // and NOT set the intermediate state, otherwise the component might re-render
                // with the old state before finishWorkout takes effect.
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

    const finishWorkout = () => {
        if (!workout) return;
        // We need to update the state to trigger the useEffect in ActiveExerciseScreen
        // But since we are using a deep copy in startWorkout, we just need to set the completed flag on the current state
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
                finishWorkout,
                cancelRest,
            }}
        >
            {children}
        </LiveWorkoutContext.Provider>
    );
};
