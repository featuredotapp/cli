
## Overview

Mailscript provides integrations with the external services Google Drive and Zoom. These integrations provide validated OAuth tokens to Mailscript Actions after the integrations are setup. The provided OAuth tokens can be used to interact directly with the integrated service.

## Google Drive

The Google Drive Integration provides an OAuth token with the permissions defined by [drive.files](https://www.googleapis.com/auth/drive.file). This allows for viewing and managing Google Drive files and folders that you have opened or created with this app.

### Setup

To setup the Google Drive Integration, simply ensure you are logged in under the CLI with:
```
mailscript login
```

Then, add the Google Drive Integration with the following:
```
mailscript integrations:add --gdrive
```

This will open up your default web browsers with a prompt to sign in to Google.

### Usage

To access the Google Drive Integration from an Action, [Variable Interpolation]() is required on `integrations.google`, which returns the Integration's OAuth token. 

Note: The Integration's OAuth token is only provided to Webhook-typed Actions.

## Zoom

The Zoom Integration provides an OAuth token. This allows for full access to the Zoom API with your authority.

Note: This Integration is not currently supported.

### Setup

There is currently no easy way to setup the Zoom Integration and is not currently supported.

### Usage

Since the Zoom Integration is not suppported yet, Zoom OAuth tokens are not exposed to Mailscript Actions.
