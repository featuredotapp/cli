# Key Concepts

### Table of Contents
- [Workflows](#workflows)
- [Triggers](#triggers)
- [Actions](#actions)
- [Daemons](#daemons)

### Workflows
Workflows allow you to setup automations for any of the adddresses you control on mailscript. A workflow consists of a trigger and an action. Whenever a trigger is met the corresponding actions will be executed.

Workflows are defined in YML and ideally should feel similar to writing github actions or Circle CI workflows. Not to say they are identical.

Visual example of what this would look like: 

<img src="media/workflow.svg"/>

### Triggers

Currently mailscript allows you to set up triggers based criteria set for incoming emails. (eg. emails sent from a specific address, emails that include attachments, contain specific words in the subject or body, mailscript even allows you to set up filters matching specific headers in your email message!)
When an incoming email meets all of the criteria the action defined in the workflow will be executed. Examples of this include sending a text message, or posting an alart to discord.

### Actions

Mailscript offers three general actions out of the box:

* Email actions: This includes forwarding the received email to secondary address of choice, and replying to the sender or all participants in the received message.
* SMS action: send a text message to a specified number
* Webhook action: send a request to a custom endpoint of your choice. The request sent to the webhook endpoint includes the parsed email JSON for any secondary operations needed by the end user.

### Daemons

The Mailscript cli allows you to use own machine, or a server, as an output for an action in a workflow.

Using the `mailscript daemon` command you can run a local daemon that will execute a script you specify as part of a workflow.

#### Example setting up a daemon

First register a new daemon action:


mailscript actions:add --name "action name" --daemon "daemon name"
We can now include the daemon in a workflow:


```
mailscript workflows:add \
  --name "workflow name" \
  --trigger "trigger name" \
  --action "daemon name"
```
Any email sent to the input and that matches the trigger, will be forwarded to the daemon listening on the daemon name action. To setup such a daemon run:

```
mailscript daemon \
  --daemon "daemon name"
  --command "cowsay \$subject"
```
The command parameter specifies the shell script to run when the workflow sends an email to the daemon action, in this case the cowsay utility. The contents of the email are made available through the $subject and $text environment variables. The command will be executed each time on each received email.