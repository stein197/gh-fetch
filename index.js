/**
 * @typedef {{
 * 	user: string;
 * 	auth: string;
 * }} Options
 * 
 * @typedef {{
 * 	info(msg: string): void;
 * 	success(msg: string): void;
 * 	error(msg: string): void;
 * }} Logger
 */

// @ts-check

/**
 * @param {string} type
 * @param {Options} opts
 * @param {Logger} logger
 * @returns {Promise}
 */
module.exports = function (type, opts, logger) {}
