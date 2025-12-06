import { db } from "../db/client";
import { exercises, programs, days, day_exercises, user_settings, user_programs, workout_logs } from "../db/schema";
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
};

async function main() {
    console.log("Welcome to the Gym Tracker Console App!");

    while (true) {
        console.log("\n--- Menu ---");
        console.log("1. View Exercises");
        console.log("2. View Programs");
        console.log("3. View Days");
        console.log("4. View User Settings");
        console.log("5. Exit");

        const answer = await askQuestion("Select an option: ");

        try {
            switch (answer) {
                case '1':
                    const allExercises = await db.select().from(exercises);
                    console.table(allExercises);
                    break;
                case '2':
                    const allPrograms = await db.select().from(programs);
                    console.table(allPrograms);
                    break;
                case '3':
                    const allDays = await db.select().from(days);
                    console.table(allDays);
                    break;
                case '4':
                    const settings = await db.select().from(user_settings);
                    console.table(settings);
                    break;
                case '5':
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
