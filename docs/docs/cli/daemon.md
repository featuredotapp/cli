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