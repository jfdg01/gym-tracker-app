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

// Get value by dot notation
function getValue(obj, keyPath) {
	return keyPath.split('.').reduce((current, key) => current?.[key], obj);
}

function main() {
	const files = fs.readdirSync(LOCALES_DIR).filter((file) => file.endsWith('.json'));
	let hasEmptyValues = false;
	let totalEmpty = 0;

	for (const file of files) {
		const filePath = path.join(LOCALES_DIR, file);

		try {
			const content = fs.readFileSync(filePath, 'utf8');
			const data = JSON.parse(content);
			const keys = getKeys(data);

			const emptyValues = [];
			for (const key of keys) {
				const value = getValue(data, key);
				if (value === '' || value === null || value === undefined) {
					emptyValues.push(key);
				}
			}

			if (emptyValues.length > 0) {
				console.log(`${colors.red}✗${colors.reset} ${file}: ${emptyValues.length} empty values`);
				console.log(
					`  ${colors.yellow}Empty keys:${colors.reset} ${emptyValues.slice(0, 5).join(', ')}${emptyValues.length > 5 ? '...' : ''}`
				);
				hasEmptyValues = true;
				totalEmpty += emptyValues.length;
			}
		} catch (error) {
			console.log(`${colors.red}✗${colors.reset} ${file}: ${error.message}`);
			hasEmptyValues = true;
		}
	}

	if (hasEmptyValues) {
		console.log(`\n${colors.red}Found ${totalEmpty} empty values across all files!${colors.reset}`);
		process.exit(1);
	} else {
		console.log(`${colors.green}✓ i18n: No empty values found${colors.reset}`);
	}
}

main();
