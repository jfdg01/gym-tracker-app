PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workout_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`program_id` integer,
	`day_id` integer,
	`completed_at` integer DEFAULT '"2025-12-02T13:10:48.898Z"',
	`duration_seconds` integer,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_workout_logs`("id", "program_id", "day_id", "completed_at", "duration_seconds") SELECT "id", "program_id", "day_id", "completed_at", "duration_seconds" FROM `workout_logs`;--> statement-breakpoint
DROP TABLE `workout_logs`;--> statement-breakpoint
ALTER TABLE `__new_workout_logs` RENAME TO `workout_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `day_exercises` ADD `min_reps` integer DEFAULT 4;--> statement-breakpoint
ALTER TABLE `day_exercises` ADD `max_reps` integer DEFAULT 12;