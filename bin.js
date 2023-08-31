#!/usr/bin/env node

// @ts-check

const process = require("node:process");
const arg = require("@stein197/cli/arg");
const index = require(".");

(async function main(...args) {
	const data = arg.parse(args);
	const [type] = data.args;
	try {
		await index(type, data.opts);
	} catch (e) {
		console.error(e.message);
	}
})(...process.argv.slice(2));
