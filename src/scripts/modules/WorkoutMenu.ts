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

        // Determine the day ID to start
        let nextDayId = -1;
        let nextDayName = "";

        const days = await services.programService.getDaysByProgramId(selected.userProgram.program_id);
        days.sort((a, b) => a.order_index - b.order_index);

        if (days.length > 0) {
            if (selected.userProgram.last_completed_day_id) {
                const lastDayIndex = days.findIndex(d => d.id === selected.userProgram.last_completed_day_id);
                if (lastDayIndex !== -1) {
                    const nextIndex = (lastDayIndex + 1) % days.length;
                    nextDayId = days[nextIndex].id;
                    nextDayName = days[nextIndex].name;
                } else {
                    nextDayId = days[0].id;
                    nextDayName = days[0].name;
                }
            } else {
                nextDayId = days[0].id;
                nextDayName = days[0].name;
            }
        }

        if (nextDayId === -1) {
            console.log("Could not determine the next day.");
            await waitForKey(askQuestion);
            continue;
        }

        console.log(`Loading exercises for: ${nextDayName}...`);
        const dayExercises = await services.programService.getDayExercisesWithDetails(nextDayId);

        if (dayExercises.length === 0) {
            console.log("No exercises found for this day.");
            await waitForKey(askQuestion);
            continue;
        }

        // Start Workout Logging
        const workoutLogId = await services.workoutService.startWorkout(nextDayId, selected.userProgram.program_id);
        const allSetLogs: any[] = [];
        const exerciseSkippedStatus: { [key: number]: boolean } = {};

        // Session Loop
        let sessionExit = false;
        for (let i = 0; i < dayExercises.length; i++) {
            if (sessionExit) break;

            const exercise = dayExercises[i];
            const totalSets = exercise.sets;
            const setsStatus: { [key: number]: { completed: boolean, value?: string } } = {};

            // Initialize sets
            for (let s = 1; s <= totalSets; s++) {
                setsStatus[s] = { completed: false };
            }

            let exerciseCompleted = false;
            while (!exerciseCompleted) {
                clearScreen();
                console.log(`\n--- Exercise ${i + 1}/${dayExercises.length} ---`);
                console.log(`Name: ${exercise.name}`);
                console.log(`Target: ${exercise.tracking_type === 'reps' ? 'Reps' : 'Time'}: ${exercise.tracking_type === 'reps' ? exercise.max_reps : exercise.max_time} | Resistance: ${exercise.resistance_type === 'weight' ? exercise.current_weight + 'kg' : exercise.difficulty_qualitative}`);
                console.log(`Description: ${exercise.description || 'N/A'}`);
                console.log("\nSets:");

                let allDone = true;
                let nextSetNum = -1;
                for (let s = 1; s <= totalSets; s++) {
                    const status = setsStatus[s].completed ? `Done: ${setsStatus[s].value}` : "Not Completed";
                    console.log(`Set ${s}: ${status}`);
                    if (!setsStatus[s].completed) {
                        allDone = false;
                        if (nextSetNum === -1) nextSetNum = s;
                    }
                }

                console.log("\nOptions:");
                console.log("0: Exit Workout (Finish Early)");
                if (!allDone) {
                    console.log("s: Skip Exercise");
                }
                if (nextSetNum !== -1) {
                    console.log(`c: Complete Set ${nextSetNum}`);
                }

                if (allDone) {
                    console.log("Press Enter to continue to next exercise...");
                }

                const input = await askQuestion("Action: ");

                if (input === '0') {
                    sessionExit = true;
                    exerciseCompleted = true;
                } else if (input.toLowerCase() === 's' && !allDone) {
                    exerciseSkippedStatus[exercise.id] = true;
                    exerciseCompleted = true; // Skip to next
                } else if (allDone && input === '') {
                    exerciseCompleted = true;
                } else if (input.toLowerCase() === 'c' && nextSetNum !== -1) {
                    const val = await askQuestion(`Enter ${exercise.tracking_type === 'reps' ? 'reps' : 'time'} completed: `);
                    setsStatus[nextSetNum] = { completed: true, value: val };

                    // Add to log buffer
                    allSetLogs.push({
                        exercise_id: exercise.id,
                        set_number: nextSetNum,
                        reps: exercise.tracking_type === 'reps' ? parseInt(val) : null,
                        time: exercise.tracking_type === 'time' ? parseInt(val) : null,
                        weight: exercise.resistance_type === 'weight' ? exercise.current_weight : null,
                        difficulty_qualitative: exercise.resistance_type === 'difficulty' ? exercise.difficulty_qualitative : null,
                        is_skipped: false
                    });
                }
            }
        }

        // Determine Completion Status
        // A workout is complete if all exercises are either fully completed or skipped.
        // If the user exited early (sessionExit = true), it's likely incomplete unless they finished the last one and then exited?
        // Actually, if they exit early, we assume incomplete.
        // If they finished the loop, we check if every exercise was visited.

        let isWorkoutCompleted = !sessionExit;

        // Add skipped logs for skipped exercises
        for (const ex of dayExercises) {
            if (exerciseSkippedStatus[ex.id]) {
                allSetLogs.push({
                    exercise_id: ex.id,
                    // Schema: set_number integer not null.
                    // Let's use 1 for skipped exercise generic log.
                    set_number: 1,
                    is_skipped: true
                });
            }
        }

        console.log("\nSaving workout data...");
        await services.workoutService.completeWorkout(workoutLogId, allSetLogs, isWorkoutCompleted);

        console.log(`\nWorkout ${isWorkoutCompleted ? 'Completed' : 'Saved (Incomplete)'}!`);
        await waitForKey(askQuestion);
        return; // Return to main menu
    }
};
