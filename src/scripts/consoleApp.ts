import { ExerciseRepository } from "../repositories/ExerciseRepository";
import { ProgramRepository } from "../repositories/ProgramRepository";
import { DayRepository } from "../repositories/DayRepository";
import { UserRepository } from "../repositories/UserRepository";
import { WorkoutRepository } from "../repositories/WorkoutRepository";
import { ExerciseService } from "../services/ExerciseService";
import { ProgramService } from "../services/ProgramService";
import { UserService } from "../services/UserService";
import { WorkoutService } from "../services/WorkoutService";
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { db } from "../db/client";
import {
    exercises,
    programs,
    days,
    day_exercises,
    user_settings,
    user_programs,
    workout_logs
} from "../db/schema";

// Initialize Repositories
const exerciseRepo = new ExerciseRepository();
const programRepo = new ProgramRepository();
const dayRepo = new DayRepository();
const userRepo = new UserRepository();
const workoutRepo = new WorkoutRepository();

// Initialize Services
const exerciseService = new ExerciseService(exerciseRepo);
const programService = new ProgramService(programRepo, dayRepo);
const userService = new UserService(userRepo);
const workoutService = new WorkoutService(workoutRepo, dayRepo, exerciseRepo, userRepo);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
};

const DATA_DIR = path.join(__dirname, 'data');

const exportData = async () => {
    try {
        const allExercises = await exerciseService.getAllExercises();
        const allPrograms = await programRepo.getAll();
        const programsData = await programService.getAllPrograms();
        const allDays = await programService.getAllDays();
        const allDayExercises = await programService.getAllDayExercises();
        const allUserSettings = await userService.getAllUserSettings();
        const allUserPrograms = await userService.getAllUserPrograms();
        const allWorkoutLogs = await workoutService.getAllWorkoutLogs();

        const data = {
            exercises: allExercises,
            programs: programsData,
            days: allDays,
            day_exercises: allDayExercises,
            user_settings: allUserSettings,
            user_programs: allUserPrograms,
            workout_logs: allWorkoutLogs
        };

        const filename = await askQuestion("Enter filename to export to (default: gym_tracker_export.json): ");
        const finalFilename = filename || 'gym_tracker_export.json';
        const finalPath = path.join(DATA_DIR, finalFilename);

        // Ensure directory exists
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        fs.writeFileSync(finalPath, JSON.stringify(data, null, 2));
        console.log(`Data exported successfully to ${finalPath}`);
    } catch (error) {
        console.error("Error exporting data:", error);
    }
};

const importData = async () => {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            console.error(`Data directory not found at ${DATA_DIR}`);
            return;
        }

        const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.json'));

        if (files.length === 0) {
            console.log("No JSON files found in data directory.");
            return;
        }

        console.log("\nAvailable files:");
        files.forEach((file, index) => {
            console.log(`${index + 1}. ${file}`);
        });

        const answer = await askQuestion("\nSelect file number to import: ");
        const fileIndex = parseInt(answer) - 1;

        if (isNaN(fileIndex) || fileIndex < 0 || fileIndex >= files.length) {
            console.error("Invalid selection.");
            return;
        }

        const fileName = files[fileIndex];
        const filePath = path.join(DATA_DIR, fileName);

        console.log(`Importing from ${filePath}...`);

        const fileContent = fs.readFileSync(filePath, 'utf-8');

        if (!fileContent || fileContent.trim() === '') {
            console.error("Error: The selected file is empty.");
            return;
        }

        let data;
        try {
            data = JSON.parse(fileContent);
        } catch (parseError) {
            console.error("Error: Failed to parse JSON file. It may be malformed.");
            return;
        }

        if (data.exercises && Array.isArray(data.exercises)) {
            try {
                await exerciseService.importExercises(data.exercises);
                console.log(`Processed exercises.`);
            } catch (e) { console.error("Error importing exercises:", e); }
        }

        if (data.programs && Array.isArray(data.programs)) {
            try {
                await programService.importPrograms(data.programs);
                console.log(`Processed programs.`);
            } catch (e) { console.error("Error importing programs:", e); }
        }

        if (data.days && Array.isArray(data.days)) {
            try {
                await programService.importDays(data.days);
                console.log(`Processed days.`);
            } catch (e) { console.error("Error importing days:", e); }
        }

        if (data.day_exercises && Array.isArray(data.day_exercises)) {
            try {
                await programService.importDayExercises(data.day_exercises);
                console.log(`Processed day_exercises.`);
            } catch (e) { console.error("Error importing day_exercises:", e); }
        }

        if (data.user_settings && Array.isArray(data.user_settings)) {
            try {
                await userService.importUserSettings(data.user_settings);
                console.log(`Processed user_settings.`);
            } catch (e) { console.error("Error importing user_settings:", e); }
        }

        if (data.user_programs && Array.isArray(data.user_programs)) {
            try {
                await userService.importUserPrograms(data.user_programs);
                console.log(`Processed user_programs.`);
            } catch (e) { console.error("Error importing user_programs:", e); }
        }

        if (data.workout_logs && Array.isArray(data.workout_logs)) {
            try {
                // Convert timestamp numbers/strings to Dates for Drizzle
                const formattedLogs = data.workout_logs.map((log: any) => ({
                    ...log,
                    completed_at: log.completed_at ? new Date(log.completed_at) : null
                }));
                await workoutService.importWorkoutLogs(formattedLogs);
                console.log(`Processed workout_logs.`);
            } catch (e) { console.error("Error importing workout_logs:", e); }
        }

        console.log("Import process completed.");

    } catch (error) {
        console.error("Error importing data:", error);
    }
};

const resetDatabase = async () => {
    const confirmation = await askQuestion("Are you sure you want to DELETE ALL DATA? (y/n): ");
    if (confirmation.toLowerCase() !== 'y') {
        console.log("Operation cancelled.");
        return;
    }

    try {
        console.log("Deleting workout logs...");
        await db.delete(workout_logs);
        console.log("Deleting user programs...");
        await db.delete(user_programs);
        console.log("Deleting day exercises...");
        await db.delete(day_exercises);
        console.log("Deleting days...");
        await db.delete(days);
        console.log("Deleting programs...");
        await db.delete(programs);
        console.log("Deleting exercises...");
        await db.delete(exercises);
        console.log("Deleting user settings...");
        await db.delete(user_settings);

        console.log("Database reset successfully.");
    } catch (error) {
        console.error("Error resetting database:", error);
    }
};

async function main() {
    console.log("Welcome to the Gym Tracker Console App!");

    while (true) {
        console.log("\n--- Menu ---");
        console.log("1. View Exercises");
        console.log("2. View Programs");
        console.log("3. View Days");
        console.log("4. View User Settings");
        console.log("5. Export Data");
        console.log("6. Import Data");
        console.log("7. Reset Database");
        console.log("8. Exit");

        const answer = await askQuestion("Select an option: ");

        try {
            switch (answer) {
                case '1':
                    const allExercises = await exerciseService.getAllExercises();
                    console.table(allExercises);
                    break;
                case '2':
                    const allPrograms = await programService.getAllPrograms();
                    console.table(allPrograms);
                    break;
                case '3':
                    const allDays = await programService.getAllDays();
                    console.table(allDays);
                    break;
                case '4':
                    // Using generic getAllUserSettings to view all rows, though usually singleton
                    const settings = await userService.getAllUserSettings();
                    console.table(settings);
                    break;
                case '5':
                    await exportData();
                    break;
                case '6':
                    await importData();
                    break;
                case '7':
                    await resetDatabase();
                    break;
                case '8':
                    console.log("Goodbye!");
                    rl.close();
                    return;
                default:
                    console.log("Invalid option, please try again.");
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
    }
}

main();
