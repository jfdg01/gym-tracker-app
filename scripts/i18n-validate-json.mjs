#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');

// ANSI color codes
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m'
};

let hasErrors = false;

function validateJSON(filePath) {
	try {
		const content = fs.readFileSync(filePath, 'utf8');
		JSON.parse(content);
		return true;
	} catch (error) {
		console.log(`${colors.red}✗${colors.reset} ${path.basename(filePath)}: ${error.message}`);
		hasErrors = true;
		return false;
	}
}

function main() {
	const files = fs.readdirSync(LOCALES_DIR).filter((file) => file.endsWith('.json'));

	for (const file of files) {
		const filePath = path.join(LOCALES_DIR, file);
		validateJSON(filePath);
	}

	if (hasErrors) {
		console.log(`\n${colors.red}Found JSON syntax errors!${colors.reset}`);
		process.exit(1);
	} else {
		console.log(`${colors.green}✓ i18n: All JSON files valid${colors.reset}`);
	}
}

main();
