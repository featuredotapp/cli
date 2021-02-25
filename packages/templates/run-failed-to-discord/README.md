# Mailscript templates: GitHub action fails, post message to discord #channel

You can use this template to setup a workflow that listens in to incoming messages and whenever it receives a message from github notifying a github action failed post the message's subject to a discord channel.

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
  - name: Build failed to discord#channel
    input: $username@mailscript.com
    trigger: github-build-failed
    action: github-build-failed-discord-action
triggers:
  - name: github-build-failed
    composition:
      - criteria:
          from: notifications@github.com
          subjectContains: run failed
actions:
  - name: github-build-failed-discord-action
    type: webhook
    config:
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
