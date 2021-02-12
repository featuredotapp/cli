
- Misc:
  - [`mailscript login`](#login)
  - [`mailscript daemon`](#daemon)
  - [`mailscript send [FILE]`](#send)
  - [`mailscript --version`](#version)

# login

Sign up or login to your account

## `mailscript login`

link or create your MailScript account

```
USAGE
  $ mailscript login

OPTIONS
  -o, --offline

DESCRIPTION
  Link or create your MailScript account
```

# daemon

Run scripts within a local daemon in response to emails recieved in Mailscript.

## `mailscript daemon`

Run a daemon to execute scripts on email arrival

```
USAGE
  $ mailscript daemon

OPTIONS
  -h, --help         show CLI help
  --command=command  (required) The shell command to run on message received. The parts of the email will be injected as environment variable: $subject, $text, $html and $payload
  --daemon=daemon    (required) the name of the daemon to register as
```
# send

Send an email from one of your addresses

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

### Help

`mailscript help [command]` - Display help for mailscript commands

### Version

`mailscript --version` - Display information on the cli version currently installed
