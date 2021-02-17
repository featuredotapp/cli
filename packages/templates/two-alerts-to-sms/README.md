# Mailscript templates: two alerts within a minute send an sms

You can use this template to setup a workflow that listens in to incoming messages and whenever two emails containing the word "alert" in their subject arrive within a minute of each other send an sms to a specified number.

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
  - name: sms to me
    type: sms
    sms: "+123456789"
  - name: address@mailscript.com
    type: mailscript-email
    address: address@mailscript.com
    key: owner
workflows:
  - name: Alerts to sms
    trigger:
      accessory: address@mailscript.com
      config:
        times:
          thisManySeconds: 60
          thisManyTimes: 2
        criterias:
          - subjectContains: alert
    actions:
      - accessory: sms to me
        config:
          type: sms
          text: Two alerts arrived within 60 seconds
```

## Manual setup

Setup your sms accessory to be able to receive texts:

```sh
mailscript accessories:add --name "sms to me" --sms +123456789
```

Setup the workflow:

```sh
mailscript workflows:add \
  --name "2 alerts to sms" \
  --trigger address@mailscript.com \
  --times 2 \
  --seconds 60 \
  --subjectcontains alert \
  --action "sms to me" \
  --text "Two alerts arrived within 60 seconds"
```
