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
    completeDay: () => Promise<void>;
    getCurrentDay: () => DayPlan | undefined;
    isLoading: boolean;
    setProgram: (programId: number) => Promise<void>;
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
                    restTimeSeconds: dayExercise.rest_time_seconds || 60,
                    sets: Array.from({ length: dayExercise.target_sets || 3 }).map((_, i) => ({
                        id: `${day.id}-${exercise.id}-${i}`,
                        targetReps: dayExercise.target_reps || 10,
                        targetWeight: 0, // Default weight, could be fetched from history
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

    const completeDay = async () => {
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

            // Log workout (optional, but good practice)
            const currentDay = program[currentDayIndex];
            // We need the day_id from the DB, which we have in our loadedProgram structure as string, convert back to number
            const dayId = parseInt(currentDay.id);

            await db.insert(schema.workout_logs).values({
                program_id: currentProgramId,
                day_id: dayId,
                completed_at: new Date(),
                duration_seconds: 0, // Placeholder
            });

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

    return (
        <ProgramContext.Provider
            value={{
                currentDayIndex,
                program,
                completeDay,
                getCurrentDay,
                isLoading,
                setProgram,
            }}
        >
            {children}
        </ProgramContext.Provider>
    );
};
