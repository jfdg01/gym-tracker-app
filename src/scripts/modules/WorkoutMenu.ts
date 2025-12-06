import { DataServices } from "./DataTransfer";
import { clearScreen, waitForKey } from "./ConsoleUI";

export const handleWorkoutMenu = async (
    services: DataServices,
    askQuestion: (query: string) => Promise<string>
) => {
    while (true) {
        clearScreen();
        console.log("\n--- Workout Session ---");

        // 1. Get all active programs
        const allUserPrograms = await services.userService.getAllUserPrograms();
        const activeUserPrograms = allUserPrograms.filter(up => up.is_active);

        if (activeUserPrograms.length === 0) {
            console.log("You have 0 active programs.");
            await waitForKey(askQuestion);
            return;
        }

        console.log(`You have ${activeUserPrograms.length} active programs.\n`);

        // Map to store temporary info for selection
        // Index -> { userProgramId, programName }
        const selectionMap = new Map<number, any>();

        for (let i = 0; i < activeUserPrograms.length; i++) {
            const userProgram = activeUserPrograms[i];
            const program = await services.programService.getProgramById(userProgram.program_id);
            const days = await services.programService.getDaysByProgramId(userProgram.program_id);

            // Sort days by order
            days.sort((a, b) => a.order_index - b.order_index);

            let lastDayName = "None";
            let nextDayName = "Unknown";

            if (days.length > 0) {
                if (userProgram.last_completed_day_id) {
                    const lastDayIndex = days.findIndex(d => d.id === userProgram.last_completed_day_id);
                    if (lastDayIndex !== -1) {
                        lastDayName = days[lastDayIndex].name;
                        // Determine next day
                        const nextIndex = (lastDayIndex + 1) % days.length;
                        nextDayName = days[nextIndex].name;
                    } else {
                        // Last completed day ID invalid or not found in current program days
                        // Reset to first?
                        nextDayName = days[0].name;
                    }
                } else {
                    // No day completed yet
                    nextDayName = days[0].name;
                }
            } else {
                nextDayName = "No days in program";
            }

            console.log(`Program ${i + 1}: ${program ? program.name : 'Unknown Program'}`);
            console.log(`Today you need to complete: ${nextDayName}`);
            console.log(`Last day you did: ${lastDayName}`);
            console.log(""); // Empty line

            selectionMap.set(i + 1, {
                userProgram,
                program
            });
        }

        console.log("Back: 0");

        const answer = await askQuestion("Select the program you want to start a session: ");

        if (answer === '0') return;

        const selectionIndex = parseInt(answer);
        if (isNaN(selectionIndex) || !selectionMap.has(selectionIndex)) {
            console.log("Invalid selection. Please try again.");
            await waitForKey(askQuestion, "Press Enter to try again...");
            continue;
        }

        const selected = selectionMap.get(selectionIndex);
        console.log(`\nStarting session for ${selected.program?.name || 'Program'}...`);
        console.log("WIP");

        // Pause to let user see WIP
        await waitForKey(askQuestion);
        // For now, return to menu or loop? 
        // User request: "this would start the workout, for now after selecting a workout, simply add a "WIP" section"
        // I'll loop back to allow selecting another or exiting.
    }
};
