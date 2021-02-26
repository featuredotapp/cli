# sync

import/export configuration between files and Mailscript

## `mailscript sync:export`

export your Mailscript config to file

```
USAGE
  $ mailscript sync:export

OPTIONS
  -h, --help       show CLI help
  -p, --path=path  path to the file to read/write
```

## `mailscript sync:import`

import and update config from file into Mailscript

```
USAGE
  $ mailscript sync:import

OPTIONS
  -d, --delete      force delete of entities missing from import file
  -h, --help        show CLI help
  -p, --path=path   (required) path to the file to read/write
  --noninteractive  do not ask for user input
```
