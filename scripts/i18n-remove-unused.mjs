#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const REFERENCE_LOCALE = 'en.json';

// ANSI color codes
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m'
};

// Get all keys from a nested object
function getKeys(obj, prefix = '') {
	const keys = new Set();
	for (const [key, value] of Object.entries(obj)) {
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			getKeys(value, fullKey).forEach((k) => keys.add(k));
		} else {
			keys.add(fullKey);
		}
	}
	return keys;
}

// Remove key from object by dot notation
function removeKey(obj, keyPath) {
	const keys = keyPath.split('.');
	const lastKey = keys.pop();
	const target = keys.reduce((current, key) => current?.[key], obj);

	if (target && typeof target === 'object') {
		delete target[lastKey];
	}
}

function main() {
	// Load reference locale
	const referencePath = path.join(LOCALES_DIR, REFERENCE_LOCALE);
	const referenceData = JSON.parse(fs.readFileSync(referencePath, 'utf8'));
	const referenceKeys = getKeys(referenceData);

	const files = fs
		.readdirSync(LOCALES_DIR)
		.filter((file) => file.endsWith('.json') && file !== REFERENCE_LOCALE);
	let processedCount = 0;
	let totalRemoved = 0;
	let hasErrors = false;

	for (const file of files) {
		const filePath = path.join(LOCALES_DIR, file);

		try {
			const content = fs.readFileSync(filePath, 'utf8');
			const data = JSON.parse(content);
			const localeKeys = getKeys(data);

			// Find unused keys
			const unusedKeys = [...localeKeys].filter((key) => !referenceKeys.has(key));

			if (unusedKeys.length > 0) {
				// Remove unused keys
				for (const key of unusedKeys) {
					removeKey(data, key);
				}

				// Write back to file
				const formattedContent = JSON.stringify(data, null, '\t') + '\n';
				fs.writeFileSync(filePath, formattedContent);

				processedCount++;
				totalRemoved += unusedKeys.length;
			}
		} catch (error) {
			console.log(`${colors.red}✗${colors.reset} ${file}: ${error.message}`);
			hasErrors = true;
		}
	}

	if (hasErrors) {
		process.exit(1);
	} else if (totalRemoved > 0) {
		console.log(
			`${colors.green}✓ i18n: Removed ${totalRemoved} unused keys from ${processedCount} files${colors.reset}`
		);
	} else {
		console.log(`${colors.green}✓ i18n: No unused keys found${colors.reset}`);
	}
}

main();
