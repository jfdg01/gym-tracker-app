import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Exercise } from './LiveWorkoutContext';
import { db } from '../db/client';
import * as schema from '../db/schema';
import { eq, asc } from 'drizzle-orm';

export type DayPlan = {
    id: string;
    name: string;
    exercises: Exercise[];
    isRestDay: boolean;
};

type ProgramContextType = {
    currentDayIndex: number;
    program: DayPlan[];
    completeDay: (completedExercises?: Exercise[]) => Promise<void>;
    getCurrentDay: () => DayPlan | undefined;
    isLoading: boolean;
    setProgram: (programId: number) => Promise<void>;
    currentProgramId: number | null;
    refreshProgram: () => Promise<void>;
};

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export const useProgram = () => {
    const context = useContext(ProgramContext);
    if (!context) {
        throw new Error('useProgram must be used within a ProgramProvider');
    }
    return context;
};

export const ProgramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [program, setProgramState] = useState<DayPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentProgramId, setCurrentProgramId] = useState<number | null>(null);

    const loadProgramData = useCallback(async (programId: number) => {
        try {
            // Fetch days for the program
            const days = await db.select().from(schema.days)
                .where(eq(schema.days.program_id, programId))
                .orderBy(asc(schema.days.order_index));

            const loadedProgram: DayPlan[] = [];

            for (const day of days) {
                // Fetch exercises for the day
                const dayExercises = await db.select({
                    dayExercise: schema.day_exercises,
                    exercise: schema.exercises
                })
                    .from(schema.day_exercises)
                    .innerJoin(schema.exercises, eq(schema.day_exercises.exercise_id, schema.exercises.id))
                    .where(eq(schema.day_exercises.day_id, day.id))
                    .orderBy(asc(schema.day_exercises.order_index));

                const exercises: Exercise[] = dayExercises.map(({ dayExercise, exercise }) => ({
                    id: exercise.id.toString(),
                    name: exercise.name,
                    restTimeSeconds: exercise.rest_time_seconds || 60,
                    minReps: exercise.min_reps || 4,
                    maxReps: exercise.max_reps || 12,
                    sets: Array.from({ length: exercise.sets || 3 }).map((_, i) => ({
                        id: `${day.id}-${exercise.id}-${i}`,
                        targetReps: exercise.max_reps || 10,
                        targetWeight: exercise.weight || 0,
                        completed: false,
                    })),
                }));

                loadedProgram.push({
                    id: day.id.toString(),
                    name: day.name,
                    isRestDay: !!day.is_rest_day,
                    exercises,
                });
            }

            setProgramState(loadedProgram);
        } catch (error) {
            console.error('Error loading program data:', error);
        }
    }, []);

    const init = useCallback(async () => {
        setIsLoading(true);
        try {
            // Check user settings
            const settings = await db.select().from(schema.user_settings).limit(1);
            let activeProgramId: number;
            let activeDayIndex = 0;

            if (settings.length > 0) {
                if (settings[0].current_program_id) {
                    activeProgramId = settings[0].current_program_id;
                    activeDayIndex = settings[0].current_day_index || 0;
                } else {
                    // Fallback if program_id is null in settings (shouldn't happen ideally)
                    const programs = await db.select().from(schema.programs).where(eq(schema.programs.name, 'PPL Program')).limit(1);
                    if (programs.length > 0) {
                        activeProgramId = programs[0].id;
                        // Update settings
                        await db.update(schema.user_settings).set({ current_program_id: activeProgramId }).where(eq(schema.user_settings.id, settings[0].id));
                    } else {
                        setIsLoading(false);
                        return;
                    }
                }
            } else {
                // Create default settings
                const programs = await db.select().from(schema.programs).where(eq(schema.programs.name, 'PPL Program')).limit(1);
                if (programs.length > 0) {
                    activeProgramId = programs[0].id;
                    await db.insert(schema.user_settings).values({
                        current_program_id: activeProgramId,
                        current_day_index: 0
                    });
                } else {
                    // No programs seeded yet?
                    setIsLoading(false);
                    return;
                }
            }

            setCurrentProgramId(activeProgramId);
            setCurrentDayIndex(activeDayIndex);
            await loadProgramData(activeProgramId);

        } catch (error) {
            console.error('Error initializing program context:', error);
        } finally {
            setIsLoading(false);
        }
    }, [loadProgramData]);

    useEffect(() => {
        init();
    }, [init]);

    const completeDay = async (completedExercises?: Exercise[]) => {
        if (program.length === 0 || currentProgramId === null) return;

        const nextDayIndex = (currentDayIndex + 1) % program.length;
        setCurrentDayIndex(nextDayIndex);

        try {
            // Update user settings
            const settings = await db.select().from(schema.user_settings).limit(1);
            if (settings.length > 0) {
                await db.update(schema.user_settings)
                    .set({ current_day_index: nextDayIndex })
                    .where(eq(schema.user_settings.id, settings[0].id));
            }

            // Log workout
            const currentDay = program[currentDayIndex];
            const dayId = parseInt(currentDay.id);

            await db.insert(schema.workout_logs).values({
                program_id: currentProgramId,
                day_id: dayId,
                completed_at: new Date(),
                duration_seconds: 0, // Placeholder
            });

            // Progressive Overload Logic
            if (completedExercises) {
                for (const exercise of completedExercises) {
                    // Find the exercise in the DB to get current config
                    const dbExercise = await db.select().from(schema.exercises).where(eq(schema.exercises.id, parseInt(exercise.id))).limit(1);

                    if (dbExercise.length > 0) {
                        const currentConfig = dbExercise[0];
                        let newWeight = currentConfig.weight || 0;
                        let weightChanged = false;

                        // Use the adjustment calculated during the workout if available
                        if (exercise.nextSessionWeightAdjustment !== undefined && exercise.nextSessionWeightAdjustment !== 0) {
                            newWeight += exercise.nextSessionWeightAdjustment;
                            if (newWeight < 0) newWeight = 0;
                            weightChanged = true;
                        } else {
                            // Fallback logic if no adjustment was calculated (e.g. legacy or error)
                            // We'll stick to the simple logic: check last set
                            const lastSet = exercise.sets[exercise.sets.length - 1];
                            if (lastSet && lastSet.completed && lastSet.actualReps !== undefined) {
                                const minReps = currentConfig.min_reps || 4;
                                const maxReps = currentConfig.max_reps || 12;

                                if (lastSet.actualReps < minReps) {
                                    newWeight -= 2.5; // Default decrement
                                    if (newWeight < 0) newWeight = 0;
                                    weightChanged = true;
                                } else if (lastSet.actualReps > maxReps) {
                                    newWeight += 2.5; // Default increment
                                    weightChanged = true;
                                }
                            }
                        }

                        if (weightChanged) {
                            await db.update(schema.exercises)
                                .set({ weight: newWeight })
                                .where(eq(schema.exercises.id, parseInt(exercise.id)));
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    const setProgram = async (programId: number) => {
        setIsLoading(true);
        try {
            setCurrentProgramId(programId);
            setCurrentDayIndex(0); // Reset progress when switching programs? Or keep it? Usually reset.

            // Update settings
            const settings = await db.select().from(schema.user_settings).limit(1);
            if (settings.length > 0) {
                await db.update(schema.user_settings)
                    .set({ current_program_id: programId, current_day_index: 0 })
                    .where(eq(schema.user_settings.id, settings[0].id));
            } else {
                await db.insert(schema.user_settings).values({
                    current_program_id: programId,
                    current_day_index: 0
                });
            }

            await loadProgramData(programId);
        } catch (error) {
            console.error('Error setting program:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentDay = () => {
        return program[currentDayIndex];
    };

    const refreshProgram = async () => {
        if (currentProgramId) {
            await loadProgramData(currentProgramId);
        }
    };

    return (
        <ProgramContext.Provider
            value={{
                currentDayIndex,
                program,
                completeDay,
                getCurrentDay,
                isLoading,
                setProgram,
                currentProgramId,
                refreshProgram,
            }}
        >
            {children}
        </ProgramContext.Provider>
    );
};
