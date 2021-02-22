# Mailscript templates: auto reply to first time sender

You can use this template to setup a workflow that listens in to incoming email messages and when it gets a hit from a first time sender it will auto reply with a message saying you'll get back to them as soon as possible.

## Workflow

```yml
version: "0.1"
addresses:
  address@mailscript.com:
    keys:
      - name: owner
        read: true
        write: true
accessories:
  - name: address@mailscript.com
    type: mailscript-email
    address: address@mailscript.com
    key: owner
workflows:
  - name: auto reply to first time sender
    trigger:
      accessory: address@mailscript.com
      config:
        criterias:
          - firstTimeSender: true
    actions:
      - accessory: address@mailscript.com
        config:
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
