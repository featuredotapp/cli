# Mailscript CLI
## Table of Contents
* [Notes](#notes)
* [Examples](#examples)
* [Overview](#overview)
* [Commands](#commands)
* [Configuration](#configuration)
* [API](API.md)


## Notes
See getting [key concepts](key-concepts.md) for more info about how mailscript works. When ready take a look at the [get started page](get-started.md)

## Examples
- [Example YML workflow](annotated-workflow.yml)
- [Combined triggers and actions](combined.md)
- [Email to google spreadsheet](https://github.com/mailscript/template-email-to-google-spreadsheet)
- [Github action failure email to notification](https://github.com/mailscript/template-github-action-failure-to-notification)


## Overview

In order to use the mailscript CLI must first install it wth the global flag. Run the following...
```
**Login local daemon**
```sh-session
$ mailscript login
... You should see a browser window open prompting you to login to your mailscript account.
```

```sh
Configure and manipulate email pipeline in Mailscript from the cli

VERSION
  mailscript/0.4.9 win32-x64 node-v12.18.0

USAGE
  $ mailscript [COMMAND]

TOPICS
  actions    add an action
  addresses  configure your email addresses
  keys       add an address key
  sync       import/export configuration between files and Mailscript
  triggers   add a trigger
  workflows  configure your workflows

COMMANDS
  daemon  Run a daemon to execute scripts on email arrival
  help    display help for mailscript
  login
  send    send an email from a mailscript address
```

## Commands

* [`mailscript actions`](actions.md)

*Actions are what gets executed in response to a predetermined triggered. This can be sending a text message, forwarding the email, or ignoring the email entirely to a name few. Click the link above to see full list of available sub commands.*

* [`mailscript addresses`](addresses.md)

*This is where you would manage all of your mailscript addresses. Listing out created addresses, creating new addresses and deleting addresses no longer in use. Click the link above to see full list of available sub commands.*
* [`mailscript daemon`](misc.md#daemon)

*Run a local email processing daemon. Useful for custom made email processing software.*

* [`mailscript help [COMMAND]`](misc.md#help)
* [`mailscript keys`](keys.md)

*Manage SMTP credientials for redirecting emails from your own email address to mailscript. Click the link above to see full list of available sub commands.*


* [`mailscript login`](misc.md#login)
* [`mailscript send [FILE]`](misc.md#send)

*Sends an email from your mailscript address*

* [`mailscript sync:export`](sync.md#mailscript-syncexport)
* [`mailscript sync:import`](sync.md#mailscript-syncimport)

*Import/export configuration to and from mailscript.*

* [`mailscript triggers`](triggers.md)

*Manage triggers. Triggers are rule sets which help mailscript know where to redirect an email to. Triggers are combined with actions to create a workflow. Click the link above to see full list of available sub commands.*

* [`mailscript workflows`](workflows.md)

*Manage workflows. Workflows are a conjunction of actions and triggers defining the filter -> action relationship. They also include other metadata such as specifiying a different email address. It is possible to have multiple email addresses and workflows on the same account. Click the link above to see full list of available sub commands.

## Configuration
The mailscript CLI saves a configuration file at the follow location for windows, macOSX and Linux. In the event this must be removed for whatever reason the default location is available here.

Windows: `/Users/<Username>/.mailscript`

Linux: `~/.mailscript`

MacOSX: `~/.mailscript`