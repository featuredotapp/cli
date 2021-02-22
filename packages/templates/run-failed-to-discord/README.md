# Mailscript templates: GitHub action fails, post message to discord #channel

You can use this template to setup a workflow that listens in to incoming messages and whenever it receives a message from github notifying a github action failed post the message's subject to a discord channel.

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
  - name: Build failed to discord#channel
    trigger:
      accessory: address@mailscript.com
      config:
        criterias:
          - from: notifications@github.com
            subjectContains: run failed
    actions:
      - config:
          type: webhook
          body: |
            {
              "content": "Build failed: {{msg.subject}}"
            }
          url: "https://discord.webhook"
          opts:
            headers:
              Content-Type: application/json
            method: POST
```

## Manual setup

Expects `body.json` file containing `{ content: "Build failed: {{msg.subject}}" }`

```sh
mailscript workflows:add \
  --name "Build failed to discord#channel" \
  --trigger address@mailscript.com \
  --from notifications@github.com \
  --subjectcontains "run failed" \
  --action webhook \
  --webhook "https://discord.webhook" \
  --body body.json
```

## Discord setup

Make sure you have edit access to a given channel. Navigate to `Edit channel > Integrations > Webhhoks` and create a new webhook (or pick an existing one). Copy the webhook url and added it the `body.json` file.
