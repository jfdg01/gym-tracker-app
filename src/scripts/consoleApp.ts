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

        const filePath = await askQuestion("Enter file path to export (default: gym_tracker_export.json): ");
        const finalPath = filePath || 'gym_tracker_export.json';

        fs.writeFileSync(finalPath, JSON.stringify(data, null, 2));
        console.log(`Data exported successfully to ${finalPath}`);
    } catch (error) {
        console.error("Error exporting data:", error);
    }
};

const importData = async () => {
    try {
        const filePath = await askQuestion("Enter file path to import: ");
        if (!fs.existsSync(filePath)) {
            console.error("File not found!");
            return;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);

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
                await workoutService.importWorkoutLogs(data.workout_logs);
                console.log(`Processed workout_logs.`);
            } catch (e) { console.error("Error importing workout_logs:", e); }
        }

        console.log("Import process completed.");

    } catch (error) {
        console.error("Error importing data:", error);
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
        console.log("7. Exit");

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
