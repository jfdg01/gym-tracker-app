#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m'
};

// Run a command and return a promise
function runCommand(command, args = []) {
	return new Promise((resolve) => {
		const child = spawn(command, args, { stdio: 'pipe' });
		let stdout = '';
		let stderr = '';

		child.stdout.on('data', (data) => {
			stdout += data.toString();
		});

		child.stderr.on('data', (data) => {
			stderr += data.toString();
		});

		child.on('close', (code) => {
			resolve({ code, stdout, stderr });
		});
	});
}

async function main() {
	console.log(`${colors.bright}${colors.blue}Running i18n auto-fix...${colors.reset}\n`);

	const commands = [
		{ name: 'Validate JSON', cmd: 'node', args: [path.join(__dirname, 'i18n-validate-json.mjs')] },
		{ name: 'Sort keys', cmd: 'node', args: [path.join(__dirname, 'i18n-sort-keys.mjs')] },
		{
			name: 'Remove unused keys',
			cmd: 'node',
			args: [path.join(__dirname, 'i18n-remove-unused.mjs')]
		},
		{
			name: 'Check empty values',
			cmd: 'node',
			args: [path.join(__dirname, 'i18n-check-empty.mjs')]
		}
	];

	let hasErrors = false;
	let fixedCount = 0;

	for (const { name, cmd, args } of commands) {
		const result = await runCommand(cmd, args);

		if (result.code === 0) {
			// Only show output if something was actually fixed
			if (
				result.stdout.includes('✓ i18n:') &&
				!result.stdout.includes('already') &&
				!result.stdout.includes('No')
			) {
				console.log(result.stdout.trim());
				fixedCount++;
			}
		} else {
			console.log(`${colors.red}✗${colors.reset} ${name} failed:`);
			console.log(result.stdout);
			console.log(result.stderr);
			hasErrors = true;
		}
	}

	if (hasErrors) {
		console.log(`\n${colors.red}Auto-fix completed with errors${colors.reset}`);
		process.exit(1);
	} else if (fixedCount > 0) {
		console.log(
			`\n${colors.green}✓ i18n: Auto-fix completed, ${fixedCount} operations performed${colors.reset}`
		);
	} else {
		console.log(`${colors.green}✓ i18n: Auto-fix completed, no changes needed${colors.reset}`);
	}
}

main().catch(console.error);
