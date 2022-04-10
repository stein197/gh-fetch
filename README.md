# Script that exports all GitHub user repositories and gists
Exports all GitHub repositories and gists that user have to the current directory.

## Usage
```
node index.js <user> <auth> [--verbose] [--gistsDir=<dir>] [--reposDir=<dir>] [--gistsPlain] [--noRepos] [--noGists]
```
Where:
- `<user>` - User name
- `<auth>` - Personal access token
- `--verbose` - Enable verbose output
- `--gistsDir` - Where to place gists. `Gists` by default
- `--reposDir` - Where to place repositories. `Projects` by default
- `--gistsPlain` - Place all files in a single directory rather than in individual directories
- `--noRepos` - Do not update repositories
- `--noGists` - Do not update gists

This will create two folders in the current directory: Gists and Projects.
