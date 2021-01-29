MailScript cli
==============

Configure and use mailscript from the command-line

[![Version](https://img.shields.io/npm/v/mailscript.svg)](https://npmjs.org/package/mailscript)
[![Downloads/week](https://img.shields.io/npm/dw/mailscript.svg)](https://npmjs.org/package/mailscript)
[![License](https://img.shields.io/npm/l/mailscript.svg)](https://github.com/mailscript/mailscript/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
* [Development](#development)
* [Publish](#publish)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g mailscript
$ mailscript COMMAND
running command...
$ mailscript (-v|--version|version)
mailscript/0.4.7 darwin-x64 node-v14.15.0
$ mailscript --help [COMMAND]
USAGE
  $ mailscript COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
- [MailScript cli](#mailscript-cli)
- [Usage](#usage)
- [Commands](#commands)
  - [`mailscript actions:add`](#mailscript-actionsadd)
  - [`mailscript actions:combine`](#mailscript-actionscombine)
  - [`mailscript actions:delete`](#mailscript-actionsdelete)
  - [`mailscript actions:list`](#mailscript-actionslist)
  - [`mailscript addresses:add`](#mailscript-addressesadd)
  - [`mailscript addresses:delete`](#mailscript-addressesdelete)
  - [`mailscript addresses:list`](#mailscript-addresseslist)
  - [`mailscript daemon`](#mailscript-daemon)
  - [`mailscript help [COMMAND]`](#mailscript-help-command)
  - [`mailscript keys:add`](#mailscript-keysadd)
  - [`mailscript keys:delete`](#mailscript-keysdelete)
  - [`mailscript keys:list`](#mailscript-keyslist)
  - [`mailscript keys:update`](#mailscript-keysupdate)
  - [`mailscript login`](#mailscript-login)
  - [`mailscript send [FILE]`](#mailscript-send-file)
  - [`mailscript sync:export`](#mailscript-syncexport)
  - [`mailscript sync:import`](#mailscript-syncimport)
  - [`mailscript triggers:add`](#mailscript-triggersadd)
  - [`mailscript triggers:delete`](#mailscript-triggersdelete)
  - [`mailscript triggers:list`](#mailscript-triggerslist)
  - [`mailscript workflows:add`](#mailscript-workflowsadd)
  - [`mailscript workflows:delete`](#mailscript-workflowsdelete)
  - [`mailscript workflows:list`](#mailscript-workflowslist)
- [Development](#development)
- [Publish](#publish)

## `mailscript actions:add`

add an action

```
USAGE
  $ mailscript actions:add

OPTIONS
  -f, --forward=forward    email address for forward action
  -h, --help               show CLI help
  -n, --name=name          (required) name of the action
  -r, --reply              reply to incoming email
  -s, --subject=subject    subject of the email
  -w, --webhook=webhook    url of the webhook to call
  --alias=alias            email address for alias action
  --body=body              file to take webhook body from
  --daemon=daemon          the name of the daemon to send to
  --from=from              email address to use as sending from
  --headers=headers        file to take webhook headers from
  --html=html              html of the email
  --method=(PUT|POST|GET)  [default: POST] HTTP method to use in webhook
  --noninteractive         do not ask for user input
  --replyall               reply all to incoming email
  --send=send              email address for send action
  --sms=sms                the sms number to send to
  --text=text              text of the email
```

_See code: [src/commands/actions/add.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/actions/add.ts)_

## `mailscript actions:combine`

create an action by combining other actions

```
USAGE
  $ mailscript actions:combine

OPTIONS
  -h, --help       show CLI help
  --action=action  (required) Action to combine
  --name=name      (required) the name of the new actions
```

_See code: [src/commands/actions/combine.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/actions/combine.ts)_

## `mailscript actions:delete`

delete an action

```
USAGE
  $ mailscript actions:delete

OPTIONS
  -a, --action=action  (required) id of the action to be acted deleted
  -h, --help           show CLI help
```

_See code: [src/commands/actions/delete.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/actions/delete.ts)_

## `mailscript actions:list`

list the actions

```
USAGE
  $ mailscript actions:list

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/actions/list.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/actions/list.ts)_

## `mailscript addresses:add`

add an email address

```
USAGE
  $ mailscript addresses:add

OPTIONS
  -a, --address=address  (required) the address
  -h, --help             show CLI help
```

_See code: [src/commands/addresses/add.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/addresses/add.ts)_

## `mailscript addresses:delete`

delete an email address

```
USAGE
  $ mailscript addresses:delete

OPTIONS
  -a, --address=address  (required) the address
  -h, --help             show CLI help
```

_See code: [src/commands/addresses/delete.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/addresses/delete.ts)_

## `mailscript addresses:list`

list your email addresses

```
USAGE
  $ mailscript addresses:list

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/addresses/list.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/addresses/list.ts)_

## `mailscript daemon`

Run a daemon to execute scripts on email arrival

```
USAGE
  $ mailscript daemon

OPTIONS
  -h, --help         show CLI help

  --command=command  (required) The shell command to run on message received. The parts of the email will be injected as
                     environment variable: $subject, $text, $html and $payload

  --daemon=daemon    (required) the name of the daemon to register as
```

_See code: [src/commands/daemon.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/daemon.ts)_

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

## `mailscript keys:add`

add an address key

```
USAGE
  $ mailscript keys:add

OPTIONS
  -a, --address=address  (required) the email address to look for keys against
  -h, --help             show CLI help
  -n, --name=name        (required) the name for the key
  -r, --read             set the key with read permissions
  -w, --write            set the key with write permissions
```

_See code: [src/commands/keys/add.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/keys/add.ts)_

## `mailscript keys:delete`

delete an address key

```
USAGE
  $ mailscript keys:delete

OPTIONS
  -a, --address=address  (required) the email address to look for keys against
  -h, --help             show CLI help
  -k, --key=key          (required) the id of the address key
```

_See code: [src/commands/keys/delete.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/keys/delete.ts)_

## `mailscript keys:list`

list the address keys for an address

```
USAGE
  $ mailscript keys:list

OPTIONS
  -a, --address=address  (required) the email address to look for keys against
  -h, --help             show CLI help
```

_See code: [src/commands/keys/list.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/keys/list.ts)_

## `mailscript keys:update`

update an address key

```
USAGE
  $ mailscript keys:update

OPTIONS
  -a, --address=address  (required) the email address to look for keys against
  -h, --help             show CLI help
  -k, --key=key          (required) the id of the address key
  -n, --name=name        (required) the name for the key
  -r, --read             set the key with read permissions
  -w, --write            set the key with write permissions
```

_See code: [src/commands/keys/update.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/keys/update.ts)_

## `mailscript login`

Link or create your MailScript account

```
USAGE
  $ mailscript login

OPTIONS
  -o, --offline

DESCRIPTION
  Link or create your MailScript account
```

_See code: [src/commands/login.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/login.ts)_

## `mailscript send [FILE]`

send an email from a mailscript address

```
USAGE
  $ mailscript send [FILE]

OPTIONS
  -b, --text=text        text of email
  -f, --from=from        (required) email address to use for sending
  -h, --help             show CLI help
  -s, --subject=subject  (required) subject line of email
  -t, --to=to            (required) email address to send to
```

_See code: [src/commands/send.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/send.ts)_

## `mailscript sync:export`

export your Mailscript config to file

```
USAGE
  $ mailscript sync:export

OPTIONS
  -h, --help       show CLI help
  -p, --path=path  path to the file to read/write
```

_See code: [src/commands/sync/export.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/sync/export.ts)_

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

_See code: [src/commands/sync/import.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/sync/import.ts)_

## `mailscript triggers:add`

add a trigger

```
USAGE
  $ mailscript triggers:add

OPTIONS
  -h, --help                         show CLI help
  -n, --name=name                    (required) name of the trigger
  --and=and                          combine sub-triggers into a new trigger with "and" logic
  --domain=domain                    constrain trigger to emails are from an email address with the given domain
  --equals=equals                    the value used against the property param
  --firsttimesender                  constrain trigger to emails that are the first seen from the sending address
  --from=from                        constrain trigger to emails from the specified address
  --hasattachments                   constrain trigger to emails with attachments
  --hasthewords=hasthewords          constrain trigger to emails that have the words specified
  --or=or                            combine sub-triggers into a new trigger with "or" logic
  --property=property                constrain trigger to emails where the property matches, use with --equals
  --seconds=seconds                  period of time to calculate the trigger over
  --sentto=sentto                    constrain trigger to emails sent to the specified address
  --subjectcontains=subjectcontains  constrain trigger to emails whose subject contains the specified text
  --times=times                      number of emails in a period for trigger to activate
```

_See code: [src/commands/triggers/add.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/triggers/add.ts)_

## `mailscript triggers:delete`

delete a trigger

```
USAGE
  $ mailscript triggers:delete

OPTIONS
  -h, --help             show CLI help
  -t, --trigger=trigger  (required) id of the trigger to be acted on
```

_See code: [src/commands/triggers/delete.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/triggers/delete.ts)_

## `mailscript triggers:list`

list the triggers

```
USAGE
  $ mailscript triggers:list

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/triggers/list.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/triggers/list.ts)_

## `mailscript workflows:add`

add a workflow

```
USAGE
  $ mailscript workflows:add

OPTIONS
  -a, --action=action    (required) name of the action accessory
  -h, --help             show CLI help
  -n, --name=name        (required) name of the workflow
  -o, --input=input      (required) name of the input
  -t, --trigger=trigger  name of the trigger accessory
  --workflow=workflow    id of the workflow to be acted on
```

_See code: [src/commands/workflows/add.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/workflows/add.ts)_

## `mailscript workflows:delete`

delete a workflow

```
USAGE
  $ mailscript workflows:delete

OPTIONS
  -h, --help               show CLI help
  -w, --workflow=workflow  (required) id of the workflow to be acted on
```

_See code: [src/commands/workflows/delete.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/workflows/delete.ts)_

## `mailscript workflows:list`

list the workflows

```
USAGE
  $ mailscript workflows:list

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/workflows/list.ts](https://github.com/getmailscript/cli/blob/v0.4.7/src/commands/workflows/list.ts)_
<!-- commandsstop -->

# Development

In development a `.env` file is used:
****
```shell
MAILSCRIPT_CONFIG_PATH=.mailscript-test # path to use for .mailscript config file
MAILSCRIPT_LOGIN_URL=http://localhost:3000 # login website url
MAILSCRIPT_API_SERVER=http://localhost:7000/v2 # api server url
MAILSCRIPT_EMAIL_DOMAIN=mailscript.io # the domain to use when assign email addresses
MAILSCRIPT_DAEMON_BRIDGE_URL=ws://localhost:8888 # the daemon bridge service
```

To run a command:

```shell
nvm use
node bin/run version
```

# Publish

Publishing the cli is a manual process.

First check that the cli passes tests and linting:

```shell
y format:check
y test
```

To publish, ensure you are on `main`. Then you will need the `team@mailscript` login to npm to publish:

```shell
npm login
npm version patch # or major or minor
git push
npm publish
```
