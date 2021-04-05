# Mailscript templates: upload email to google drive

You can use this template to setup a workflow that listens in to incoming email messages and when it gets a hit it will add the email to a Google Drive folder.

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
  - name: save-email-to-google-drive
    input: $username@mailscript.com
    action: save-pdf-to-google-drive
actions:
  - name: save-email-to-google-drive
    type: webhook
    config:
      body: |
        {
          "content": "{{all}}",
          "driveStoragePath": "storage/path/on/google/drive",
          "googleDriveAuth": "{{integrations.google}}"
        }
      url: "https://us-central1-mailscript-firebase.cloudfunctions.net/googleDriveEmailUploader"
      opts:
        headers:
          Content-Type: application/json
        method: POST
```

## Step by step setup

1. `mailscript login`
2. `mailscript integrations:add --gdrive`
3. Change the "driveStoragePath" value in `config.yml` from "storage/path/on/google/drive" to the folder path you'd like store your emails in.
4. `mailscript sync:import -p config.yml`
5. Done.
