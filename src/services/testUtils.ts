import { NewExercise } from "../../repositories/ExerciseRepository";

export const getRandomString = (length: number = 10): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const getRandomNumber = (min: number = 0, max: number = 100): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomBoolean = (): boolean => {
    return Math.random() < 0.5;
};

export const getRandomEnum = <T>(values: T[]): T => {
    return values[Math.floor(Math.random() * values.length)];
};

export const generateRandomExercise = (): NewExercise => {
    return {
        name: getRandomString(15),
        description: getRandomString(50),
        track_type: getRandomEnum(['reps', 'time']),
        resistance_type: getRandomEnum(['weight', 'text']),
        // created_at and updated_at are usually handled by DB defaults, but we can provide them if needed
        // For NewExercise (InsertModel), they might be optional or required depending on schema
        // Looking at schema: .defaultFn(() => new Date()) means they are optional in insert if drizzle handles it, 
        // but InferInsertModel might make them optional.
        // Let's assume we don't need to pass them for creation.
    } as NewExercise;
};

export const generateRandomPartialExercise = (): Partial<NewExercise> => {
    const exercise = generateRandomExercise();
    const partial: Partial<NewExercise> = {};

    if (getRandomBoolean()) partial.name = exercise.name;
    if (getRandomBoolean()) partial.description = exercise.description;
    if (getRandomBoolean()) partial.track_type = exercise.track_type;
    if (getRandomBoolean()) partial.resistance_type = exercise.resistance_type;

    return partial;
};

export const generateRandomProgram = (): any => {
    return {
        name: getRandomString(15),
        description: getRandomString(50),
    };
};

export const generateRandomPartialProgram = (): any => {
    const program = generateRandomProgram();
    const partial: any = {};
    if (getRandomBoolean()) partial.name = program.name;
    if (getRandomBoolean()) partial.description = program.description;
    return partial;
};

export const generateRandomDay = (programId: number = 1): any => {
    return {
        program_id: programId,
        name: getRandomString(10),
        is_rest_day: getRandomBoolean(),
        order_index: getRandomNumber(1, 10),
    };
};

export const generateRandomPartialDay = (): any => {
    const day = generateRandomDay();
    const partial: any = {};
    if (getRandomBoolean()) partial.name = day.name;
    if (getRandomBoolean()) partial.is_rest_day = day.is_rest_day;
    if (getRandomBoolean()) partial.order_index = day.order_index;
    return partial;
};

export const generateRandomUserSettings = (): any => {
    return {
        language: getRandomEnum(['es', 'en', 'fr']),
        name: getRandomString(10),
        current_program_id: getRandomNumber(),
        last_day_id: getRandomNumber(),
    };
};

export const generateRandomPartialUserSettings = (): any => {
    const settings = generateRandomUserSettings();
    const partial: any = {};
    if (getRandomBoolean()) partial.language = settings.language;
    if (getRandomBoolean()) partial.name = settings.name;
    if (getRandomBoolean()) partial.current_program_id = settings.current_program_id;
    if (getRandomBoolean()) partial.last_day_id = settings.last_day_id;
    return partial;
};

export const generateRandomWorkoutLog = (): any => {
    return {
        program_id: getRandomNumber(),
        day_id: getRandomNumber(),
        duration_seconds: getRandomNumber(60, 3600),
    };
};

export const generateRandomPartialWorkoutLog = (): any => {
    const log = generateRandomWorkoutLog();
    const partial: any = {};
    if (getRandomBoolean()) partial.program_id = log.program_id;
    if (getRandomBoolean()) partial.day_id = log.day_id;
    if (getRandomBoolean()) partial.duration_seconds = log.duration_seconds;
    return partial;
};

export const generateRandomWorkoutSet = (workoutLogId: number = 1): any => {
    return {
        workout_log_id: workoutLogId,
        exercise_id: getRandomNumber(),
        day_exercise_id: getRandomNumber(),
        set_number: getRandomNumber(1, 5),
        actual_reps: getRandomNumber(1, 20),
        actual_weight: getRandomNumber(10, 100),
        actual_time_seconds: getRandomNumber(10, 120),
        actual_resistance_text: getRandomString(10),
        target_reps: getRandomNumber(1, 20),
        target_weight: getRandomNumber(10, 100),
        target_time_seconds: getRandomNumber(10, 120),
        skipped: getRandomBoolean(),
    };
};


