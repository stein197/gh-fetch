/**
 * @typedef {{
 * 	root: string;
 * 	opts: Options;
 * 	logger: Logger;
 * }} Application
 * 
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

const Type = {
	Repo: "repo",
	Gist: "gist"
};

/**
 * @param {string} root
 * @param {string} type
 * @param {Partial<Options>} opts
 * @param {Logger} logger
 * @returns {Promise}
 */
module.exports = function (root, type, opts, logger) {
	type_check(type);
	options_check(opts);
	const app = app_create(root, opts, logger);
	switch (type) {
		case Type.Repo:
			break;
		case Type.Gist:
			break;
	}
	return Promise.resolve();
}

/**
 * @param {string} type
 */
function type_check(type) {
	const types_allowed = Object.values(Type);
	if (!types_allowed.includes(type))
		throw new Error(`Unknown type ${type}: Allowed types are ${types_allowed.join(", ")}`);
}

/**
 * @param {Partial<Options>} opts
 */
function options_check(opts) {
	if (!opts.user?.length)
		throw new Error("User is not provided");
	if (!opts.auth?.length)
		throw new Error("Auth is not provided");
}

/**
 * @param {string} root
 * @param {Options} opts
 * @param {Logger} logger
 * @returns {Application}
 */
function app_create(root, opts, logger) {
	return {root, opts, logger};
}
