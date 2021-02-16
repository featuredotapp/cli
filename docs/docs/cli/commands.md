# mailscript

```sh
Configure and manipulate email pipeline in Mailscript from the cli

VERSION
  mailscript/0.3.27 darwin-x64 node-v14.3.0

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
  daemon     Run a daemon to execute scripts on email arrival
  help       display help for mailscript
  login
  send       send an email from a mailscript address
  usernames  manipulate usernames
```

### Help

`mailscript help [command]` - Display help for mailscript commands

### Version

`mailscript --version` - Display information on the cli version currently installed

### See also

- [`addresses`](/cli/addresses) - Manipulates addresses
- [`keys`](/cli/keys) - Manipulates address keys
- [`actions`](/cli/actions) - Manipulates actions
- [`triggers`](/cli/triggers) - Manipulates triggers
- [`sync`](/cli/sync) - Allows to import/export triggers, actions and workflows
- [`workflows`](/cli/workflows) - Manipulates workflows
- [`login`](/cli/login) - Sign up or login to your account
- [`send`](/cli/send) - Send an email from one of your addresses
- [`usernames`](/cli/usernames) - Manipulates usernames
