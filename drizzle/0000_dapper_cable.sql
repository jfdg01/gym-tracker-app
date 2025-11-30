CREATE TABLE `exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`variant` text,
	`muscle_group` text,
	`equipment` text,
	`description` text,
	`photo_url` text,
	`is_custom` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `performed_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer,
	`exercise_id` integer,
	`type` text DEFAULT 'working',
	`set_number` integer NOT NULL,
	`reps` integer NOT NULL,
	`weight` real NOT NULL,
	`rpe` integer,
	`completed` integer DEFAULT false,
	`timestamp` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `program_days` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`program_id` integer,
	`name` text NOT NULL,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`schedule_sequence` text NOT NULL,
	`is_active` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`program_id` integer,
	`day_id` integer,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`day_id`) REFERENCES `program_days`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `target_exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_id` integer,
	`exercise_id` integer,
	`superset_id` integer,
	`order` integer NOT NULL,
	`type` text DEFAULT 'working',
	`target_sets` integer,
	`target_reps` integer,
	`target_weight` real,
	`rest_time` integer,
	`notes` text,
	FOREIGN KEY (`day_id`) REFERENCES `program_days`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`active_program_id` integer,
	`current_day_index` integer DEFAULT 0,
	`language` text DEFAULT 'en',
	`sound_enabled` integer DEFAULT true,
	FOREIGN KEY (`active_program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action
);
