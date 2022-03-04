const child_process = require("child_process");
const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");
const process = require("process");

const VERBOSE = process.argv.some(arg => arg === "--verbose" || arg === "-v");
const DEFAULT_USER_AGENT = `Node.js/${process.version.slice(1)} (${os.platform()} ${os.release()}; ${process.arch})`;
const API_HOST = "api.github.com";
const API_USER_REPOS = "/user/repos";

(async function main(...args) {
	const [user, auth] = args;
	if (!user)
		throw new Error("User name is not provided");
	if (!auth)
		throw new Error("Auth token is not provided");
	const repos = await fetchRepos(user, auth);
	exportRepos(repos, process.cwd());
})(...process.argv.slice(2));

async function fetchRepos(user, auth) {
	let page = 1;
	let result = [];
	do {
		const response = await fetch({
			hostname: API_HOST,
			path: `${API_USER_REPOS}?page=${page++}`,
			method: "GET",
			headers: {
				"User-Agent": DEFAULT_USER_AGENT,
				"Authorization": `token ${auth}`
			}
		});
		if (response.response.statusCode >= 400)
			throw new Error(`Failed to fetch repos for user ${user}. Status: ${response.response.statusCode}`);
		var responseJson = JSON.parse(response.data);
		result = result.concat(responseJson.filter(item => item.owner.login === user).map(item => ({
			url: item.ssh_url,
			name: item.name
		})));
	} while (responseJson.length);
	return result;
}

function exportRepos(repos, dir) {
	for (const repo of repos) {
		const repoDir = path.resolve(dir, repo.name);
		process.chdir(dir);
		if (fs.existsSync(repoDir))
			repoPull(repoDir, repo.name);
		else
			repoClone(repo.url, repo.name, dir);
	}
}

function repoPull(dir, name) {
	repoOp("git pull", dir, `Pulling ${name} repository into ${dir}...`, `Pulling ${name} repository is done!`);
}

function repoClone(url, name, dir) {
	repoOp(`git clone ${url}`, dir, `Cloning ${name} repository into ${dir}...`, `Cloning ${name} repository is done!`);
}

function repoOp(op, dir, msgBefore, msgAfter) {
	if (VERBOSE)
		console.log(msgBefore);
	process.chdir(dir);
	child_process.exec(op);
	if (VERBOSE)
		console.log(msgAfter);
}

function fetch(options) {
	let result = "";
	return new Promise((resolve, reject) => {
		https.request(options, response => {
			response.on("data", data => result += data);
			response.on("end", () => resolve({
				response,
				data: result
			}));
			response.on("error", error => reject({
				response,
				data: error
			}));
		}).end();
	});
}
