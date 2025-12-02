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

// Recursively sort object keys
function sortKeys(obj) {
	if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
		return obj;
	}

	const sorted = {};
	const keys = Object.keys(obj).sort();

	for (const key of keys) {
		sorted[key] = sortKeys(obj[key]);
	}

	return sorted;
}

// Format JSON with proper indentation
function formatJSON(obj) {
	return JSON.stringify(obj, null, '\t');
}

function main() {
	const files = fs.readdirSync(LOCALES_DIR).filter((file) => file.endsWith('.json'));
	let processedCount = 0;
	let hasErrors = false;

	for (const file of files) {
		const filePath = path.join(LOCALES_DIR, file);

		try {
			const content = fs.readFileSync(filePath, 'utf8');
			const data = JSON.parse(content);
			const sortedData = sortKeys(data);
			const formattedContent = formatJSON(sortedData);

			// Only write if content changed
			if (content !== formattedContent) {
				fs.writeFileSync(filePath, formattedContent + '\n');
				processedCount++;
			}
		} catch (error) {
			console.log(`${colors.red}✗${colors.reset} ${file}: ${error.message}`);
			hasErrors = true;
		}
	}

	if (hasErrors) {
		process.exit(1);
	} else if (processedCount > 0) {
		console.log(`${colors.green}✓ i18n: Sorted keys in ${processedCount} files${colors.reset}`);
	} else {
		console.log(`${colors.green}✓ i18n: All keys already sorted${colors.reset}`);
	}
}

main();
