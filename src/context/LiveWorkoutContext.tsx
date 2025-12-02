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
    minReps: number;
    maxReps: number;
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
    startWorkout: (exercises: Exercise[]) => void;
    completeSet: (reps: number) => void;
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

    // Mock Data
    const mockWorkout: WorkoutSession = {
        startTime: new Date(),
        completed: false,
        exercises: [
            {
                id: '1',
                name: 'Squats',
                restTimeSeconds: 5,
                minReps: 4,
                maxReps: 12,
                sets: [
                    { id: 's1', targetReps: 10, targetWeight: 100, completed: false },
                    { id: 's2', targetReps: 10, targetWeight: 100, completed: false },
                ],
            },
            {
                id: '2',
                name: 'Bench Press',
                restTimeSeconds: 5,
                minReps: 4,
                maxReps: 12,
                sets: [
                    { id: 'b1', targetReps: 8, targetWeight: 80, completed: false },
                    { id: 'b2', targetReps: 8, targetWeight: 80, completed: false },
                ],
            },
            {
                id: '3',
                name: 'Deadlift',
                restTimeSeconds: 5,
                minReps: 4,
                maxReps: 12,
                sets: [
                    { id: 'd1', targetReps: 5, targetWeight: 120, completed: false },
                    { id: 'd2', targetReps: 5, targetWeight: 120, completed: false },
                ],
            },
        ],
    };

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
            if (reps > currentExercise.maxReps) {
                currentExercise.nextSessionWeightAdjustment = 2.5; // Arbitrary increase
            } else if (reps < currentExercise.minReps) {
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

        // Save progress via ProgramContext
        // We need to access ProgramContext here. Since we can't use hooks inside a function,
        // we should probably pass the completeDay function to LiveWorkoutProvider or use a callback.
        // However, the cleanest way in this architecture without refactoring everything is to 
        // expose the workout data and let the consumer (ActiveExerciseScreen) call completeDay.
        // BUT, the user requirement is "when a workout ends".
        // Let's modify the context to accept an onFinish callback or similar?
        // Or better: The ActiveExerciseScreen calls finishWorkout. It can also call completeDay.
        // Let's update this to just set state, and we'll handle the call in the Screen.

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
