# Script that exports all GitHub user repositories and gists
Exports all GitHub repositories and gists that user have to the current directory.

## Usage
```
node index.js <user> <auth> [--verbose] [--gistsDir=<dir>] [--projectsDir=<dir>]
```
Where:
- `<user>` - User name
- `<auth>` - Personal access token
- `--verbose` - Enable verbose output
- `--gistsDir` - Where to place gists. `Gists` by default
- `--projectsDir` - Where to place repositories. `Projects` by default

This will create two folders in the current directory: Gists and Projects.
