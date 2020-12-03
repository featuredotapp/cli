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
* [Development](#development)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g mailscript
$ mailscript COMMAND
running command...
$ mailscript (-v|--version|version)
mailscript/0.3.14 darwin-x64 node-v14.3.0
$ mailscript --help [COMMAND]
USAGE
  $ mailscript COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mailscript accessories SUBCOMMAND`](#mailscript-accessories-subcommand)
* [`mailscript addresses SUBCOMMAND`](#mailscript-addresses-subcommand)
* [`mailscript automations SUBCOMMAND`](#mailscript-automations-subcommand)
* [`mailscript help [COMMAND]`](#mailscript-help-command)
* [`mailscript keys SUBCOMMAND`](#mailscript-keys-subcommand)
* [`mailscript login`](#mailscript-login)
* [`mailscript send [FILE]`](#mailscript-send-file)
* [`mailscript sync SUBCOMMAND`](#mailscript-sync-subcommand)
* [`mailscript usernames SUBCOMMAND`](#mailscript-usernames-subcommand)

## `mailscript accessories SUBCOMMAND`

manipulate accessories

```
USAGE
  $ mailscript accessories SUBCOMMAND

OPTIONS
  -a, --accessory=accessory  id of the accessory to act upon
  -h, --help                 show CLI help
  -n, --name=name            the name of the automation
  --sms=sms                  the telephone number to send the sms too
```

_See code: [src/commands/accessories.ts](https://github.com/getmailscript/cli/blob/v0.3.14/src/commands/accessories.ts)_

## `mailscript addresses SUBCOMMAND`

manipulate addresses

```
USAGE
  $ mailscript addresses SUBCOMMAND

OPTIONS
  -a, --address=address  the address
  -h, --help             show CLI help
```

_See code: [src/commands/addresses.ts](https://github.com/getmailscript/cli/blob/v0.3.14/src/commands/addresses.ts)_

## `mailscript automations SUBCOMMAND`

manipulate automations

```
USAGE
  $ mailscript automations SUBCOMMAND

OPTIONS
  -a, --action=action                id of the action accessory
  -f, --forward=forward              email address for forward action
  -h, --help                         show CLI help
  -h, --html=html                    html of the email
  -r, --reply                        email address for reply action
  -s, --subject=subject              subject of the email
  -t, --name=name                    name of the automation
  -t, --text=text                    text of the email
  -t, --trigger=trigger              id of the trigger accessory
  -w, --webhook=webhook              url of the webhook to call
  --alias=alias                      email address for alias action
  --automation=automation            id of the automation to be acted on
  --body=body                        file to take webhook body from
  --domain=domain                    constrain trigger to emails are from an email address with the given domain
  --from=from                        constrain trigger to emails from the specified address
  --hasattachments                   constrain trigger to emails with attachments
  --hasthewords=hasthewords          constrain trigger to emails that have the words specified
  --headers=headers                  file to take webhook headers from
  --method=(PUT|POST|GET)            [default: POST] HTTP method to use in webhook
  --replyall                         email address for reply all action
  --seconds=seconds                  period of time to calculate the trigger over
  --send=send                        email address for send action
  --sentto=sentto                    constrain trigger to emails sent to the specified address
  --subjectcontains=subjectcontains  constrain trigger to emails whose subject contains the specified text
  --times=times                      number of emails in a period for trigger to activate
```

_See code: [src/commands/automations.ts](https://github.com/getmailscript/cli/blob/v0.3.14/src/commands/automations.ts)_

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

## `mailscript keys SUBCOMMAND`

Manipulate address keys

```
USAGE
  $ mailscript keys SUBCOMMAND

OPTIONS
  -h, --help         show CLI help
  --address=address  the email address to look for keys against
  --key=key          the id of the address key
  --name=name        the name for the key
  --read             set the key with read permissions
  --write            set the key with write permissions
```

_See code: [src/commands/keys.ts](https://github.com/getmailscript/cli/blob/v0.3.14/src/commands/keys.ts)_

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

_See code: [src/commands/login.ts](https://github.com/getmailscript/cli/blob/v0.3.14/src/commands/login.ts)_

## `mailscript send [FILE]`

send an email from a mailscript address

```
USAGE
  $ mailscript send [FILE]

OPTIONS
  -b, --text=text        text of email
  -h, --help             show CLI help
  -s, --subject=subject  (required) subject line of email
  -t, --from=from        (required) email address to use for sending
  -t, --to=to            (required) email address to send to
```

_See code: [src/commands/send.ts](https://github.com/getmailscript/cli/blob/v0.3.14/src/commands/send.ts)_

## `mailscript sync SUBCOMMAND`

allows current setup to be exported, imported, or/and updated

```
USAGE
  $ mailscript sync SUBCOMMAND

OPTIONS
  -d, --delete     force delete of entities missing from import file
  -h, --help       show CLI help
  -p, --path=path  path to the file to read/write
```

_See code: [src/commands/sync.ts](https://github.com/getmailscript/cli/blob/v0.3.14/src/commands/sync.ts)_

## `mailscript usernames SUBCOMMAND`

manipulate usernames

```
USAGE
  $ mailscript usernames SUBCOMMAND

OPTIONS
  -h, --help               show CLI help
  -n, --username=username  the username to claim
```

_See code: [src/commands/usernames.ts](https://github.com/getmailscript/cli/blob/v0.3.14/src/commands/usernames.ts)_
<!-- commandsstop -->

# Development

In development a `.env` file is used:

```shell
MAILSCRIPT_CONFIG_PATH=.mailscript-test # path to use for .mailscript config file
MAILSCRIPT_LOGIN_URL=http://localhost:3000 # login website url
MAILSCRIPT_API_SERVER=http://localhost:7000/v1 # api server url
```

To run a command:

```shell
nvm use
node bin/run version
```
