#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');

// ANSI color codes for terminal output
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m'
};

class I18nHygieneAnalyzer {
	constructor() {
		this.locales = new Map();
		this.referenceKeys = new Set();
		this.analysis = {
			totalLocales: 0,
			totalKeys: 0,
			missingKeys: {},
			extraKeys: {},
			inconsistentTypes: {},
			emptyValues: {},
			duplicateValues: {},
			lineCounts: {},
			fileSizes: {},
			recommendations: []
		};
	}

	// Load all locale files
	loadLocales() {
		try {
			const files = fs.readdirSync(LOCALES_DIR).filter((file) => file.endsWith('.json'));

			for (const file of files) {
				const localeCode = file.replace('.json', '');
				const filePath = path.join(LOCALES_DIR, file);
				const content = fs.readFileSync(filePath, 'utf8');

				try {
					const data = JSON.parse(content);
					this.locales.set(localeCode, data);
					this.analysis.lineCounts[localeCode] = content.split('\n').length;
					this.analysis.fileSizes[localeCode] = fs.statSync(filePath).size;
				} catch (error) {
					console.error(`${colors.red}Error parsing ${file}: ${error.message}${colors.reset}`);
				}
			}

			this.analysis.totalLocales = this.locales.size;
		} catch (error) {
			console.error(`${colors.red}Error loading locales: ${error.message}${colors.reset}`);
			process.exit(1);
		}
	}

	// Get all keys from a nested object
	getKeys(obj, prefix = '') {
		const keys = new Set();
		for (const [key, value] of Object.entries(obj)) {
			const fullKey = prefix ? `${prefix}.${key}` : key;
			if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
				this.getKeys(value, fullKey).forEach((k) => keys.add(k));
			} else {
				keys.add(fullKey);
			}
		}
		return keys;
	}

	// Get value by dot notation
	getValue(obj, keyPath) {
		return keyPath.split('.').reduce((current, key) => current?.[key], obj);
	}

	// Analyze locale consistency
	analyzeConsistency() {
		// Get reference keys (from English)
		const referenceLocale = this.locales.get('en');
		if (!referenceLocale) {
			console.error(`${colors.red}Reference locale (en) not found!${colors.reset}`);
			return;
		}

		this.referenceKeys = this.getKeys(referenceLocale);
		this.analysis.totalKeys = this.referenceKeys.size;

		// Analyze each locale
		for (const [localeCode, localeData] of this.locales) {
			const localeKeys = this.getKeys(localeData);

			// Find missing keys
			const missingKeys = [...this.referenceKeys].filter((key) => !localeKeys.has(key));
			if (missingKeys.length > 0) {
				this.analysis.missingKeys[localeCode] = missingKeys;
			}

			// Find extra keys
			const extraKeys = [...localeKeys].filter((key) => !this.referenceKeys.has(key));
			if (extraKeys.length > 0) {
				this.analysis.extraKeys[localeCode] = extraKeys;
			}

			// Check for empty values
			const emptyValues = [];
			for (const key of localeKeys) {
				const value = this.getValue(localeData, key);
				if (value === '' || value === null || value === undefined) {
					emptyValues.push(key);
				}
			}
			if (emptyValues.length > 0) {
				this.analysis.emptyValues[localeCode] = emptyValues;
			}

			// Check for type inconsistencies
			const typeInconsistencies = [];
			for (const key of this.referenceKeys) {
				if (localeKeys.has(key)) {
					const refValue = this.getValue(referenceLocale, key);
					const localeValue = this.getValue(localeData, key);
					const refType = typeof refValue;
					const localeType = typeof localeValue;

					if (refType !== localeType) {
						typeInconsistencies.push({
							key,
							expected: refType,
							actual: localeType,
							refValue,
							localeValue
						});
					}
				}
			}
			if (typeInconsistencies.length > 0) {
				this.analysis.inconsistentTypes[localeCode] = typeInconsistencies;
			}
		}

		// Check for duplicate values across locales
		this.findDuplicateValues();
	}

	// Find duplicate values across locales
	findDuplicateValues() {
		const valueMap = new Map();

		for (const [localeCode, localeData] of this.locales) {
			for (const key of this.referenceKeys) {
				const value = this.getValue(localeData, key);
				if (value !== undefined && value !== null && value !== '') {
					const valueKey = `${key}:${value}`;
					if (!valueMap.has(valueKey)) {
						valueMap.set(valueKey, []);
					}
					valueMap.get(valueKey).push(localeCode);
				}
			}
		}

		// Find values that appear in multiple locales
		for (const [valueKey, locales] of valueMap) {
			if (locales.length > 1) {
				const [key, value] = valueKey.split(':', 2);
				if (!this.analysis.duplicateValues[key]) {
					this.analysis.duplicateValues[key] = {};
				}
				this.analysis.duplicateValues[key][value] = locales;
			}
		}
	}

	// Generate recommendations
	generateRecommendations() {
		const recommendations = [];

		// Missing keys recommendations
		const totalMissingKeys = Object.values(this.analysis.missingKeys).flat().length;
		if (totalMissingKeys > 0) {
			recommendations.push({
				type: 'error',
				message: `Found ${totalMissingKeys} missing translation keys across all locales`,
				action: 'Add missing keys to incomplete locales'
			});
		}

		// Extra keys recommendations
		const totalExtraKeys = Object.values(this.analysis.extraKeys).flat().length;
		if (totalExtraKeys > 0) {
			recommendations.push({
				type: 'warning',
				message: `Found ${totalExtraKeys} extra keys that don't exist in reference locale`,
				action: 'Review and remove unused keys or add them to reference locale'
			});
		}

		// Empty values recommendations
		const totalEmptyValues = Object.values(this.analysis.emptyValues).flat().length;
		if (totalEmptyValues > 0) {
			recommendations.push({
				type: 'warning',
				message: `Found ${totalEmptyValues} empty translation values`,
				action: 'Fill in empty translation values'
			});
		}

		// Type inconsistencies recommendations
		const totalTypeIssues = Object.values(this.analysis.inconsistentTypes).flat().length;
		if (totalTypeIssues > 0) {
			recommendations.push({
				type: 'error',
				message: `Found ${totalTypeIssues} type inconsistencies`,
				action: 'Fix type mismatches between locales'
			});
		}

		// Duplicate values recommendations
		const duplicateKeys = Object.keys(this.analysis.duplicateValues).length;
		if (duplicateKeys > 0) {
			recommendations.push({
				type: 'info',
				message: `Found ${duplicateKeys} keys with identical values across multiple locales`,
				action: 'Review if translations should be different for each locale'
			});
		}

		// File size recommendations
		const fileSizes = Object.entries(this.analysis.fileSizes);
		const avgSize = fileSizes.reduce((sum, [, size]) => sum + size, 0) / fileSizes.length;
		const largeFiles = fileSizes.filter(([, size]) => size > avgSize * 1.5);
		if (largeFiles.length > 0) {
			recommendations.push({
				type: 'info',
				message: `Some locale files are significantly larger than average`,
				action: 'Review if large files have unnecessary content'
			});
		}

		this.analysis.recommendations = recommendations;
	}

	// Print analysis results
	printResults() {
		const totalMissing = Object.values(this.analysis.missingKeys).flat().length;
		const totalExtra = Object.values(this.analysis.extraKeys).flat().length;
		const totalEmpty = Object.values(this.analysis.emptyValues).flat().length;
		const totalTypeIssues = Object.values(this.analysis.inconsistentTypes).flat().length;

		// If everything is clean, show minimal output
		if (totalMissing === 0 && totalExtra === 0 && totalEmpty === 0 && totalTypeIssues === 0) {
			console.log(
				`${colors.green}✓ i18n: All ${this.analysis.totalLocales} locales clean (${this.analysis.totalKeys} keys each)${colors.reset}`
			);
			return;
		}

		// Show detailed output only when there are issues
		console.log(`\n${colors.bright}${colors.cyan}=== I18N HYGIENE ANALYSIS ===${colors.reset}\n`);

		// Summary statistics
		console.log(`${colors.bright}Summary:${colors.reset}`);
		console.log(`  Total locales: ${colors.green}${this.analysis.totalLocales}${colors.reset}`);
		console.log(`  Total keys: ${colors.green}${this.analysis.totalKeys}${colors.reset}`);
		console.log(`  Missing keys: ${colors.red}${totalMissing}${colors.reset}`);
		console.log(`  Extra keys: ${colors.yellow}${totalExtra}${colors.reset}`);
		console.log(`  Empty values: ${colors.yellow}${totalEmpty}${colors.reset}`);
		console.log(`  Type issues: ${colors.red}${totalTypeIssues}${colors.reset}`);

		// Detailed breakdown by locale
		console.log(`\n${colors.bright}Locale Details:${colors.reset}`);
		console.log('┌─────────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐');
		console.log('│ Locale      │ Lines   │ Size    │ Missing │ Extra   │ Empty   │ Type    │');
		console.log('├─────────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤');

		for (const [localeCode] of this.locales) {
			const lines = this.analysis.lineCounts[localeCode];
			const size = this.analysis.fileSizes[localeCode];
			const missing = this.analysis.missingKeys[localeCode]?.length || 0;
			const extra = this.analysis.extraKeys[localeCode]?.length || 0;
			const empty = this.analysis.emptyValues[localeCode]?.length || 0;
			const typeIssues = this.analysis.inconsistentTypes[localeCode]?.length || 0;

			console.log(
				`│ ${localeCode.padEnd(11)} │ ${lines.toString().padEnd(7)} │ ${this.formatBytes(size).padEnd(7)} │ ${missing.toString().padEnd(7)} │ ${extra.toString().padEnd(7)} │ ${empty.toString().padEnd(7)} │ ${typeIssues.toString().padEnd(7)} │`
			);
		}
		console.log('└─────────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘');

		// Missing keys details
		if (Object.keys(this.analysis.missingKeys).length > 0) {
			console.log(`\n${colors.bright}${colors.red}Missing Keys:${colors.reset}`);
			for (const [locale, keys] of Object.entries(this.analysis.missingKeys)) {
				console.log(
					`  ${colors.yellow}${locale}:${colors.reset} ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`
				);
			}
		}

		// Extra keys details
		if (Object.keys(this.analysis.extraKeys).length > 0) {
			console.log(`\n${colors.bright}${colors.yellow}Extra Keys:${colors.reset}`);
			for (const [locale, keys] of Object.entries(this.analysis.extraKeys)) {
				console.log(
					`  ${colors.yellow}${locale}:${colors.reset} ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`
				);
			}
		}

		// Type inconsistencies details
		if (Object.keys(this.analysis.inconsistentTypes).length > 0) {
			console.log(`\n${colors.bright}${colors.red}Type Inconsistencies:${colors.reset}`);
			for (const [locale, issues] of Object.entries(this.analysis.inconsistentTypes)) {
				console.log(`  ${colors.yellow}${locale}:${colors.reset}`);
				for (const issue of issues.slice(0, 3)) {
					console.log(`    ${issue.key}: expected ${issue.expected}, got ${issue.actual}`);
				}
				if (issues.length > 3) {
					console.log(`    ... and ${issues.length - 3} more`);
				}
			}
		}

		// Recommendations
		if (this.analysis.recommendations.length > 0) {
			console.log(`\n${colors.bright}${colors.blue}Recommendations:${colors.reset}`);
			for (const rec of this.analysis.recommendations) {
				const icon = rec.type === 'error' ? '❌' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
				const color =
					rec.type === 'error' ? colors.red : rec.type === 'warning' ? colors.yellow : colors.blue;
				console.log(`  ${icon} ${color}${rec.message}${colors.reset}`);
				console.log(`     → ${rec.action}`);
			}
		}

		// Generate hygiene command
		this.generateHygieneCommand();
	}

	// Generate hygiene command for fixing issues
	generateHygieneCommand() {
		console.log(`\n${colors.bright}${colors.green}Suggested Hygiene Commands:${colors.reset}`);

		const commands = [];

		// Command to check for missing keys
		if (Object.values(this.analysis.missingKeys).flat().length > 0) {
			commands.push('npm run i18n:check-missing');
		}

		// Command to validate JSON syntax
		commands.push('npm run i18n:validate-json');

		// Command to sort keys alphabetically
		commands.push('npm run i18n:sort-keys');

		// Command to remove unused keys
		if (Object.values(this.analysis.extraKeys).flat().length > 0) {
			commands.push('npm run i18n:remove-unused');
		}

		// Command to check for empty values
		if (Object.values(this.analysis.emptyValues).flat().length > 0) {
			commands.push('npm run i18n:check-empty');
		}

		if (commands.length > 0) {
			console.log(`\n${colors.cyan}# Run these commands to fix issues:${colors.reset}`);
			commands.forEach((cmd) => {
				console.log(`${colors.green}${cmd}${colors.reset}`);
			});
		}
	}

	// Format bytes to human readable format
	formatBytes(bytes) {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	// Export analysis to JSON
	exportToJSON() {
		const outputPath = path.join(__dirname, '../i18n-hygiene-report.json');
		fs.writeFileSync(outputPath, JSON.stringify(this.analysis, null, 2));
		console.log(`\n${colors.green}✓ Analysis exported to: ${outputPath}${colors.reset}`);
	}

	// Run complete analysis
	async run() {
		this.loadLocales();
		this.analyzeConsistency();
		this.generateRecommendations();

		// If --check-missing flag is provided, only show missing keys and exit
		if (process.argv.includes('--check-missing')) {
			this.printMissingKeysOnly();
			return;
		}

		this.printResults();

		// Auto-fix non-destructive issues if --auto-fix flag is provided
		if (process.argv.includes('--auto-fix')) {
			await this.runAutoFix();
		}

		// Export to JSON if requested
		if (process.argv.includes('--export')) {
			this.exportToJSON();
		}
	}

	// Run auto-fix for non-destructive operations
	async runAutoFix() {
		const { spawn } = await import('child_process');
		const path = await import('path');
		const { fileURLToPath } = await import('url');

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);

		console.log(`\n${colors.bright}${colors.blue}Running auto-fix...${colors.reset}`);

		const autoFixPath = path.join(__dirname, 'i18n-auto-fix.mjs');
		const child = spawn('node', [autoFixPath], { stdio: 'inherit' });

		return new Promise((resolve) => {
			child.on('close', (code) => {
				if (code === 0) {
					console.log(`${colors.green}✓ Auto-fix completed successfully${colors.reset}`);
				} else {
					console.log(`${colors.red}✗ Auto-fix failed with code ${code}${colors.reset}`);
				}
				resolve();
			});
		});
	}

	// Print only missing keys (for --check-missing flag)
	printMissingKeysOnly() {
		const totalMissing = Object.values(this.analysis.missingKeys).flat().length;

		if (totalMissing === 0) {
			console.log(`${colors.green}✓ No missing keys found!${colors.reset}`);
			process.exit(0);
		} else {
			console.log(`${colors.red}✗ Found ${totalMissing} missing keys:${colors.reset}\n`);

			for (const [locale, keys] of Object.entries(this.analysis.missingKeys)) {
				console.log(`${colors.yellow}${locale}:${colors.reset}`);
				for (const key of keys) {
					console.log(`  - ${key}`);
				}
				console.log();
			}

			process.exit(1);
		}
	}
}

// Run the analyzer
const analyzer = new I18nHygieneAnalyzer();
analyzer.run().catch(console.error);
