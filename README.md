MailScript cli
==============

Configure and use mailscript from the command-line

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/mailscriptcli.svg)](https://npmjs.org/package/mailscriptcli)
[![Downloads/week](https://img.shields.io/npm/dw/mailscriptcli.svg)](https://npmjs.org/package/mailscriptcli)
[![License](https://img.shields.io/npm/l/mailscriptcli.svg)](https://github.com/getmailscript/mailscriptcli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g mailscript
$ mailscript COMMAND
running command...
$ mailscript (-v|--version|version)
mailscript/0.2.0 darwin-x64 node-v14.3.0
$ mailscript --help [COMMAND]
USAGE
  $ mailscript COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mailscript address SUBCOMMAND`](#mailscript-address-subcommand)
* [`mailscript help [COMMAND]`](#mailscript-help-command)
* [`mailscript login`](#mailscript-login)
* [`mailscript workspace SUBCOMMAND`](#mailscript-workspace-subcommand)

## `mailscript address SUBCOMMAND`

manipulate addresses

```
USAGE
  $ mailscript address SUBCOMMAND

OPTIONS
  -h, --help             show CLI help
  -n, --address=address  the address
```

_See code: [src/commands/address.ts](https://github.com/getmailscript/cli/blob/v0.2.0/src/commands/address.ts)_

## `mailscript help [COMMAND]`

display help for mailscript

```
USAGE
  $ mailscript help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `mailscript login`

Link or create your MailScript account

```
USAGE
  $ mailscript login

DESCRIPTION
  Link or create your MailScript account
```

_See code: [src/commands/login.ts](https://github.com/getmailscript/cli/blob/v0.2.0/src/commands/login.ts)_

## `mailscript workspace SUBCOMMAND`

manipulate workspaces

```
USAGE
  $ mailscript workspace SUBCOMMAND

OPTIONS
  -h, --help       show CLI help
  -n, --name=name  name of the workspace
```

_See code: [src/commands/workspace.ts](https://github.com/getmailscript/cli/blob/v0.2.0/src/commands/workspace.ts)_
<!-- commandsstop -->
