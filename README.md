# Script that syncs all GitHub user repositories and gists
Syncs all GitHub repositories and gists that user have to the current directory.

## Usage
Via npm:
```
npm i -g @stein197/gh-sync
gh-sync {repo | gist} --user <user> --auth <auth> [--fake]
```
Or directly from the repository:
```
node bin.js {repo | gist} --user <user> --auth <auth> [--fake]
```

Where:
- `{repo | gist}` what kind of repository to sync
- `<user>` GitHub username
- `<auth>` GitHub Access Token
- `--fake` Do not perform real actions, just see what would happen

