CREATE TABLE `day_exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`order_index` integer NOT NULL,
	`target_sets` integer DEFAULT 3 NOT NULL,
	`target_reps` integer DEFAULT 12 NOT NULL,
	`target_weight` real DEFAULT 20,
	`target_resistance_text` text,
	`target_time_seconds` integer,
	`rest_time_seconds` integer DEFAULT 180 NOT NULL,
	`increase_rate` real DEFAULT 2.5 NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `day_exercises_day_idx` ON `day_exercises` (`day_id`);--> statement-breakpoint
CREATE INDEX `day_exercises_exercise_idx` ON `day_exercises` (`exercise_id`);--> statement-breakpoint
CREATE TABLE `days` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`program_id` integer NOT NULL,
	`name` text NOT NULL,
	`is_rest_day` integer DEFAULT false NOT NULL,
	`order_index` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `days_program_order_idx` ON `days` (`program_id`,`order_index`);--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`track_type` text DEFAULT 'reps' NOT NULL,
	`resistance_type` text DEFAULT 'weight' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`current_program_id` integer,
	`last_day_id` integer,
	`language` text DEFAULT 'es' NOT NULL,
	`name` text DEFAULT 'User' NOT NULL,
	FOREIGN KEY (`current_program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`last_day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `workout_exercise_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workout_log_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`day_exercise_id` integer,
	`set_number` integer NOT NULL,
	`actual_reps` integer,
	`actual_weight` real,
	`actual_time_seconds` integer,
	`actual_resistance_text` text,
	`target_reps` integer,
	`target_weight` real,
	`target_time_seconds` integer,
	`skipped` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`workout_log_id`) REFERENCES `workout_logs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`day_exercise_id`) REFERENCES `day_exercises`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `workout_sets_log_idx` ON `workout_exercise_sets` (`workout_log_id`);--> statement-breakpoint
CREATE INDEX `workout_sets_exercise_idx` ON `workout_exercise_sets` (`exercise_id`);--> statement-breakpoint
CREATE TABLE `workout_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`program_id` integer,
	`day_id` integer,
	`created_at` integer NOT NULL,
	`completed_at` integer,
	`duration_seconds` integer,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE set null
);
