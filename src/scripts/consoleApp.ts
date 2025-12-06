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
        console.log("2. View Programs (Interactive)");
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
                    await handleViewPrograms(programService, askQuestion);
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
                    await handleExportData(services, askQuestion);
                    break;
                case '6':
                    await handleImportData(services, askQuestion);
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
