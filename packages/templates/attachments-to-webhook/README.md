# Mailscript templates: send attachments to webhook

You can use this template to setup a workflow that listens in to incoming email messages with attachments and when it gets a hit it will deliver the attachments to an endpoint.

## Workflow

```yml
version: "0.2"
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
  - name: attachments
    trigger: attachments-trigger
    action: attachments-webhook-action
triggers:
  - name: attachments-trigger
    accessory: address@mailscript.com
    config:
      criterias:
        - hasAttachments: true
actions:
  - name: attachments-webhook-action
    config:
    type: webhook
    body: |
      {
        "attachments": "{{msg.attachments}}"
      }
    url: "https://endpoint.url"
    opts:
      headers:
        Content-Type: application/json
      method: POST
```

## Manual setup

Expects `body.json` file containing `{ attachments: "{{msg.attachments}}" }`

```sh
mailscript workflows:add \
  --name "attachments to webhook" \
  --trigger address@mailscript.com \
  --action webhook \
  --webhook "https://endpoint.url" \
  --body ./body.json
```

## Read from request

Example usage to read payload:

```js
const express = require("express")
const fs = require("fs")

const handler = async (req, res) => {
  const { attachments } = req.body
  for (const attachment of attachments) {
    const { filename, content } = attachment
    const path = `./files/${filename}`
    fs.writeFileSync(path, Buffer.from(content))
  }
  res.status(200).send({ status: "ok" })
}

const app = express()
app.post("/", express.json(), handler)
```
