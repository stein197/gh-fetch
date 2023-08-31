#!/usr/bin/env node

// @ts-check

const process = require("node:process");
const colors = require("colors");
const arg = require("@stein197/cli/arg");
const index = require(".");

(async function main(...args) {
	const data = arg.parse(args);
	const [type] = data.args;
	const logger = logger_create();
	try {
		await index(type, data.opts, logger);
	} catch (e) {
		logger.error(e.message);
		process.exit(1);
	}
})(...process.argv.slice(2));

function logger_create() {
	return {
		info(msg) {
			console.info(colors.white(`[INFO]: ${msg}`));
		},
		success(msg) {
			console.log(colors.green(`[SUCCESS]: ${msg}`));
		},
		error(msg) {
			console.error(colors.red(`[ERROR]: ${msg}`));
		}
	};
}
