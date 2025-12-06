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
import { db } from "../db/client";
import { handleViewPrograms } from "./modules/ProgramMenu";
import { handleExportData, handleImportData, DataServices } from "./modules/DataTransfer";
import { handleWorkoutMenu } from "./modules/WorkoutMenu";
import { clearScreen, waitForKey } from "./modules/ConsoleUI";
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

const services: DataServices = {
    exerciseService,
    programService,
    userService,
    workoutService,
    programRepo
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
};

// Local importData/exportData removed - imported from modules/DataTransfer

// Local handleViewPrograms removed - imported from modules/ProgramMenu

const resetDatabase = async () => {
    clearScreen();
    const confirmation = await askQuestion("Are you sure you want to DELETE ALL DATA? (y/n): ");
    if (confirmation.toLowerCase() !== 'y') {
        console.log("Operation cancelled.");
        await waitForKey(askQuestion);
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
    await waitForKey(askQuestion);
};

async function main() {
    clearScreen();
    console.log("Welcome to the Gym Tracker Console App!");
    await waitForKey(askQuestion, "Press Enter to start...");

    while (true) {
        clearScreen();
        console.log("\n--- Menu ---");
        console.log("1. Start Workout");
        console.log("2. View Exercises");
        console.log("3. View Programs (Interactive)");
        console.log("4. View Days");
        console.log("5. View User Settings");
        console.log("6. Export Data");
        console.log("7. Import Data");
        console.log("8. Reset Database");
        console.log("9. Exit");

        const answer = await askQuestion("Select an option: ");

        try {
            switch (answer) {
                case '1':
                    await handleWorkoutMenu(services, askQuestion);
                    break;
                case '2':
                    clearScreen();
                    console.log("\n--- Exercises ---");
                    const allExercises = await exerciseService.getAllExercises();
                    console.table(allExercises);
                    await waitForKey(askQuestion);
                    break;
                case '3':
                    await handleViewPrograms(programService, askQuestion);
                    break;
                case '4':
                    clearScreen();
                    console.log("\n--- Days ---");
                    const allDays = await programService.getAllDays();
                    console.table(allDays);
                    await waitForKey(askQuestion);
                    break;
                case '5':
                    clearScreen();
                    console.log("\n--- User Settings ---");
                    // Using generic getAllUserSettings to view all rows, though usually singleton
                    const settings = await userService.getAllUserSettings();
                    console.table(settings);
                    await waitForKey(askQuestion);
                    break;
                case '6':
                    await handleExportData(services, askQuestion);
                    await waitForKey(askQuestion); // Export might finish quickly
                    break;
                case '7':
                    await handleImportData(services, askQuestion);
                    await waitForKey(askQuestion);
                    break;
                case '8':
                    await resetDatabase();
                    break;
                case '9':
                    console.log("Goodbye!");
                    rl.close();
                    return;
                default:
                    console.log("Invalid option, please try again.");
                    await waitForKey(askQuestion, "Press Enter to try again...");
            }
        } catch (error) {
            console.error("An error occurred:", error);
            await waitForKey(askQuestion, "Press Enter to continue...");
        }
    }
}

main();
