The Mailscript cli allows you to use your local machine, or a server, as an output for an action in a workflow.

Using the `mailscript daemon` command you can run a local daemon that will execute a script you specify as part of a `workflow` and in response to an email.

### Setting up a daemon

First register a new daemon action:

```shell
mailscript actions:add --name "action name" --daemon "daemon name"
```

We can now include the daemon in a workflow:

```shell
mailscript workflows:add \
  --name "workflow name" \
  --trigger "trigger name" \
  --action "daemon name"
```

Any email sent to the input and that matches the trigger, will be forwarded to the daemon listening on the `daemon name` action. To setup such a daemon run:

```shell
mailscript daemon \
  --daemon "daemon name"
  --command "cowsay \$subject"
```

The command parameter specifies the shell script to run when the workflow sends an email to the daemon action, in this case the `cowsay` utility. The contents of the email are made available through the `$subject` and `$text` environment variables. The complete email object as json is passed as a string to `$payload`. The command will be executed each time an email is received.
