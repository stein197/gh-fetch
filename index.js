/**
 * @typedef {{
 * 	root: string;
 * 	opts: Options;
 * 	logger: Logger;
 * }} Application
 * 
 * @typedef {{
 * 	id: string;
 * }} GitHub.Gist
 * 
 * @typedef {{
 * 	name: string;
 * 	owner: {
 * 		login: string;
 * 	};
 * }} GitHub.Repository
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

const API_HOST = "https://api.github.com";
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
		case Type.Repo: return repo_sync_all(app);
		case Type.Gist: return gist_sync_all(app);
	}
	return Promise.resolve();
}

/**
 * @param {Application} app
 * @returns {Promise}
 */
async function repo_sync_all(app) {
	app.logger.info("Fetching repositories info...");
	const data = await repo_fetch_all(app.opts.user, app.opts.auth);
	for (const repo of data)
		repo_sync(repo, app);
}

/**
 * @param {Application} app
 * @returns {Promise}
 */
async function gist_sync_all(app) {
	app.logger.info("Fetching gist info...");
	const data = await gist_fetch_all(app.opts.user, app.opts.auth);
	for (const gist of data)
		gist_sync(gist, app);
}

/**
 * @param {GitHub.Repository} repo
 * @param {Application} app
 */
function repo_sync(repo, app) {} // TODO

/**
 * @param {GitHub.Gist} gist
 * @param {Application} app
 */
function gist_sync(gist, app) {} // TODO

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

/**
 * @param {string} user
 * @param {string} auth
 * @returns {Promise<GitHub.Repository[]>}
 */
function repo_fetch_all(user, auth) {
	return data_fetch("/user/repos", user, auth).then(data => data.filter(repo => repo.owner.login === user));
}

/**
 * @param {string} user
 * @param {string} auth
 * @returns {Promise<GitHub.Gist[]>}
 */
function gist_fetch_all(user, auth) {
	return data_fetch("/gists", user, auth);
}

/**
 * @param {string} endpoint
 * @param {string} user
 * @param {string} auth
 * @returns {Promise<any[]>}
 */
async function data_fetch(endpoint, user, auth) {
	let page = 1;
	let result = [];
	while (true) {
		const response = await fetch(API_HOST + endpoint + "?page=" + page, {
			headers: {
				Authorization: `token ${auth}`
			}
		});
		if (response.status >= 400)
			throw new Error(`Failed to fetch data for user ${user} at path ${endpoint}. Status: ${response.status}`);
		const data = await response.json();
		if (!Array.isArray(data))
			throw new Error(`Expected to be array. Actual value: ${JSON.stringify(data)}`);
		result.push(...data);
		if (!data.length)
			break;
		page++;
	}
	return result;
}
