import {
    createPlan, getPlans, getPlanDetails, updatePlan, deletePlan,
    addDayToPlan, updateDay, deleteDay, reorderDays,
    addExerciseToDay, removeExerciseFromDay, reorderExercisesInDay, replaceExerciseInDay
} from './plans';
import { db } from './client';
import { exercises } from './schema';
import { eq } from 'drizzle-orm';

export const runPlanTests = async () => {
    console.log("--- STARTING PLAN CRUD TESTS ---");

    try {
        // 0. Ensure we have some exercises
        let exerciseIds: number[] = [];
        const existingExercises = await db.select().from(exercises).limit(3);
        if (existingExercises.length < 3) {
            console.log("Seeding exercises...");
            const e1 = await db.insert(exercises).values({ name: 'Test Ex 1' }).returning({ id: exercises.id });
            const e2 = await db.insert(exercises).values({ name: 'Test Ex 2' }).returning({ id: exercises.id });
            const e3 = await db.insert(exercises).values({ name: 'Test Ex 3' }).returning({ id: exercises.id });
            exerciseIds = [e1[0].id, e2[0].id, e3[0].id];
        } else {
            exerciseIds = existingExercises.map(e => e.id);
        }

        // 1. Create Plan
        console.log("1. Creating Plan...");
        const planId = await createPlan("Test Plan", "A test plan description");
        console.log("Plan created with ID:", planId);

        // 2. Add Days
        console.log("2. Adding Days...");
        const day1Id = await addDayToPlan(planId, "Day A");
        const day2Id = await addDayToPlan(planId, "Day B");
        const day3Id = await addDayToPlan(planId, "Day C");
        console.log("Days added:", day1Id, day2Id, day3Id);

        // 3. Add Exercises to Day 1
        console.log("3. Adding Exercises to Day 1...");
        const de1 = await addExerciseToDay(day1Id, exerciseIds[0]);
        const de2 = await addExerciseToDay(day1Id, exerciseIds[1]);
        const de3 = await addExerciseToDay(day1Id, exerciseIds[2]);
        console.log("Exercises added to Day 1:", de1, de2, de3);

        // 4. Verify Plan Structure
        let plan = await getPlanDetails(planId);
        console.log("4. Plan Structure after adding:", JSON.stringify(plan, null, 2));
        if (plan?.days.length !== 3) throw new Error("Expected 3 days");
        if (plan.days[0].exercises.length !== 3) throw new Error("Expected 3 exercises in Day 1");

        // 5. Reorder Days (Swap Day A and Day B)
        console.log("5. Reordering Days (B, A, C)...");
        await reorderDays(planId, [day2Id, day1Id, day3Id]);
        plan = await getPlanDetails(planId);
        console.log("Plan days order:", plan?.days.map(d => d.name));
        if (plan?.days[0].id !== day2Id) throw new Error("Reorder failed: Day B should be first");

        // 6. Reorder Exercises in Day 1 (Swap 1 and 2)
        console.log("6. Reordering Exercises in Day 1...");
        // Current order in Day 1 (which is now second in list): de1, de2, de3
        // Let's swap to: de2, de1, de3
        await reorderExercisesInDay(day1Id, [de2, de1, de3]);
        plan = await getPlanDetails(planId);
        const day1 = plan?.days.find(d => d.id === day1Id);
        console.log("Day 1 exercises order:", day1?.exercises.map(e => e.day_exercise_id));
        if (day1?.exercises[0].day_exercise_id !== de2) throw new Error("Reorder exercises failed");

        // 7. Replace Exercise
        console.log("7. Replacing Exercise...");
        // Replace middle exercise (de1, which is now second) with exerciseIds[2] (just reusing for test)
        await replaceExerciseInDay(de1, exerciseIds[2]);
        plan = await getPlanDetails(planId);
        // Verify in logs

        // 8. Delete Day (Day C)
        console.log("8. Deleting Day C...");
        await deleteDay(day3Id);
        plan = await getPlanDetails(planId);
        console.log("Plan days after delete:", plan?.days.map(d => d.name));
        if (plan?.days.length !== 2) throw new Error("Expected 2 days");

        // 9. Delete Plan
        console.log("9. Deleting Plan...");
        await deletePlan(planId);
        const plans = await getPlans();
        if (plans.find(p => p.id === planId)) throw new Error("Plan not deleted");

        // Verify exercises still exist
        const exercisesAfter = await db.select().from(exercises).where(eq(exercises.id, exerciseIds[0]));
        if (exercisesAfter.length === 0) throw new Error("Exercises were deleted!");

        console.log("--- ALL TESTS PASSED ---");
        alert("Tests Passed! Check console for details.");

    } catch (e) {
        console.error("TEST FAILED:", e);
        alert("Tests Failed! Check console.");
    }
};
