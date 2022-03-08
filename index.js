const child_process = require("child_process");
const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");
const process = require("process");

const OPTS = {
	...{
		projectsDir: "Projects",
		gistsDir: "Gists",
		verbose: false
	},
	...Object.fromEntries(
		process.argv
			.filter(arg => arg.startsWith("-"))
			.map(arg => arg.replace(/^-+/, ""))
			.map(arg => arg.split("="))
			.map(arg => arg[1] ? arg : [arg[0], true])
	)
};
const DEFAULT_USER_AGENT = `Node.js/${process.version.slice(1)} (${os.platform()} ${os.release()}; ${process.arch})`;
const API_HOST = "api.github.com";
const API_USER_REPOS = "/user/repos";
const API_GISTS = "/gists";
const SCHEMA_REPOS = {
	url: "ssh_url",
	name: "name"
};
const SCHEMA_GISTS = {
	name: "id",
	files: "files"
};

(async function main(...args) {
	const [user, auth] = args;
	if (!user)
		throw new Error("User name is not provided");
	if (!auth)
		throw new Error("Auth token is not provided");
	const repos = await fetchData(user, auth, API_USER_REPOS, SCHEMA_REPOS);
	const gists = await fetchData(user, auth, API_GISTS, SCHEMA_GISTS);
	const cwd = process.cwd();
	exportData(repos, path.resolve(cwd, OPTS.projectsDir), exportRepo);
	exportData(gists, path.resolve(cwd, OPTS.gistsDir), exportGist);
})(...process.argv.slice(2));

async function fetchData(user, auth, path, schema) {
	let page = 1;
	let result = [];
	do {
		const response = await fetch({
			hostname: API_HOST,
			path: `${path}?page=${page++}`,
			method: "GET",
			headers: {
				"User-Agent": DEFAULT_USER_AGENT,
				"Authorization": `token ${auth}`
			}
		});
		if (response.response.statusCode >= 400)
			throw new Error(`Failed to fetch data for user ${user} at path ${path}. Status: ${response.response.statusCode}`);
		var json = JSON.parse(response.data);
		result = result.concat(
			json
				.filter(item => item.owner.login === user)
				.map(item => Object.fromEntries(
					Object.entries(schema).map(entry => [entry[0], item[entry[1]]])
				)
			)
		);
	} while (json.length);
	return result;
}

async function exportData(data, dir, callback) {
	if (!fs.existsSync(dir)) {
		log(`Creating ${dir} directory`);
		fs.mkdirSync(dir);
	}
	for (const item of data)
		await callback(item, dir);
}

async function exportRepo(repo, dir) {
	const repoDir = path.resolve(dir, repo.name);
	if (fs.existsSync(repoDir))
		await repoOp("git pull", repoDir, `Pulling ${repo.name} repository into ${repoDir}...`, `Pulling ${repo.name} repository is done!`);
	else
		await repoOp(`git clone ${repo.url}`, dir, `Cloning ${repo.name} repository into ${dir}...`, `Cloning ${repo.name} repository is done!`);
}

async function exportGist(gist, dir) {
	const gistDir = path.resolve(dir, gist.name);
	if (!fs.existsSync(gistDir))
		fs.mkdirSync(gistDir);
	log(`Updating gist ${gist.name} into ${dir}...`);
	for (const file of Object.values(gist.files)) {
		const response = await fetch(file.raw_url);
		const filePathParts = path.resolve(gistDir, file.filename).split(/[\/\\]+/);
		const fileDir = filePathParts.slice(0, filePathParts.length - 1).join(path.sep);
		if (!fs.existsSync(fileDir))
			fs.mkdirSync(fileDir, {
				recursive: true
			});
		fs.writeFileSync(path.resolve(gistDir, file.filename), response.data);
	}
	log(`Updating gist ${gist.name} is done!`);
}

async function repoOp(op, dir, msgBefore, msgAfter) {
	log(msgBefore);
	process.chdir(dir);
	try {
		await exec(op);
	} catch (ex) {
		log(ex);
	}
	log(msgAfter);
}

function fetch(options) {
	let result = "";
	return new Promise((resolve, reject) => https.request(options, response => {
		response.on("data", data => result += data);
		response.on("end", () => resolve({
			response,
			data: result
		}));
		response.on("error", error => reject({
			response,
			data: error
		}));
	}).end());
}

function exec(command) {
	return new Promise((resolve, reject) => child_process.exec(command, (error, stdout, stderr) => error ? reject(stderr) : resolve(stdout)));
}

function log(...args) {
	if (OPTS.verbose)
		console.log(...args);
}
