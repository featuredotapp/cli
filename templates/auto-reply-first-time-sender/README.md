# Mailscript templates: auto reply to first time sender

You can use this template to setup a workflow that listens in to incoming email messages and when it gets a hit from a first time sender it will auto reply with a message saying you'll get back to them as soon as possible.

## Workflow

```yml
version: "0.2"
addresses:
  $username@mailscript.com:
    keys:
      - name: owner
        read: true
        write: true
workflows:
  - name: auto reply to first time sender
    input: $username@mailscript.com
    trigger: first-time-trigger
    action: first-time-reply
triggers:
  - name: first-time-trigger
    composition:
      - criteria:
          firstTimeSender: true
actions:
  - name: first-time-reply
    type: mailscript-email
    config:
      from: $username@mailscript.com
      key: owner
      type: reply
      text: I will get back to you as soon as possible
```

## Manual setup

```sh
mailscript workflows:add \
  --name "auto reply to first time sender" \
  --trigger address@mailscript.com \
  --firsttimesender
  --reply \
  --text "I will get back to you as soon as possible"
```
