#!/usr/bin/env node

// @ts-check

const process = require("node:process");
const colors = require("colors");
const arg = require("@stein197/cli/arg");
const index = require(".");

const MS_SECOND = 1000;

(async function main(...args) {
	const data = arg.parse(args);
	const [type] = data.args;
	const logger = logger_create();
	const root = process.cwd();
	const ms = await time_measure(async () => {
		try {
			await index(root, type, data.opts, logger);
		} catch (e) {
			logger.error(e.message);
			process.exit(1);
		}
	});
	logger.info(`Time elapsed: ${ms / MS_SECOND}s`);
})(...process.argv.slice(2));

function logger_create() {
	return {
		info: msg => console.info(colors.white(`[INFO]: ${msg}`)),
		success: msg => console.log(colors.green(`[SUCCESS]: ${msg}`)),
		error: msg => console.error(colors.red(`[ERROR]: ${msg}`))
	};
}

/**
 * @param {() => Promise} f
 * @returns {Promise<number>}
 */
function time_measure(f) {
	const tmStart = Date.now();
	return f().then(() => Date.now() - tmStart);
}
