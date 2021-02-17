# Mailscript templates: send email data to google spreadsheet

You can use this template to setup a workflow that listens in to incoming email messages and when it gets a hit it will add all PDF attachments to a Google Drive folder.

## Workflow

```yml
version: '0.1'
addresses:
  local@mailscript.com:
    keys:
      - name: owner
        read: true
        write: true
accessories:
  - name: local@mailscript.com
    type: mailscript-email
    address: local@mailscript.com
    key: owner
workflows:
  - name: data to spreadsheet
    trigger:
      accessory: local@mailscript.com
      config:
        criterias: []
    actions:
      - config:
          type: webhook
          body: |
            {
              "row": "{{all}}",
              "docId": "spreadsheet-id-in-base64",
              "credsClientEmail": "service-account-email-address-in-base64",
              "credsPrivateKey": "service-account-private-key-in-base64"
            }
          url: 'https://write-to-csv-endpoint.url'
          opts:
            headers:
              Content-Type: application/json
            method: POST
```

## Manual setup

Expects `body.json` file containing a JSON object with the following props `row` (value `"{{all}}"` - notice the double quotes), `docId`, `credsClientEmail` and `credsPrivateKey`. A sample file has been included in this repo.

```sh
mailscript workflows:add --name "data to spreadsheet" \
  --trigger address@mailscript.com \
  --action webhook \
  --webhook "https://write-to-csv-endpoint.url" \
  --body body.json
```

## Step by step setup

1. Create a new google spreadsheet here: https://docs.google.com/.
2. Create a new service account here: https://console.cloud.google.com/projectselector2/iam-admin/serviceaccounts?supportedpurview=project. We suggest you setup a new project and a service account per project to be able to write/read to/from the spreadsheet but you should set this up based on your own project's needs. Hint: the simplest setup only needs you to give the service account a name.
3. Once the service account has been created, select it and create a new key in JSON format. You should be prompted to save a `json` file locally. We'll need 2 pieces of data from that file: `client_email` and `private_key`.
4. Encode both the `client_email` and `private_key` to `base64` format. If you have access to a JavaScript context you can use the `btoa` function (`btoa('Any string')`). Input the appropriate values into the `body.json` file.
5. Setup a cloud function to write the data. Using your serverless provider of choice you'll need to setup an endpoint to write/read to/from the spreadsheet. A [`handler.js`](./handler.js) file has been added to this repo where you can see a code example used to write/read data programmatically to/from the google spreadsheet.
6. Done, you can now start to `csvsify` your email data.
