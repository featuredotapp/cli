# Templates

This sections provides a list of public templates anyone can import and utilize in their own use cases.

## Table of Contents
- [Available Templates](#available-templates)
- [Create Your own](#create-your-own)


## Available Templates
- [Attachments to webhook](attachments-to-webhook/README.md)
- [Auto reply to first time sender](auto-reply-first-time-sender/README.md)
- [Email to google spreadsheet](email-to-google-spreadsheet/README.md)
- [Github action failure to notification](github-action-failure-to-notification/README.md)
- [Run failed to discord](run-failed-to-discord/README.md)
- [Shared address for team](shared-address-for-team/README.md)
- [Trigger and action combination](trigger-and-action-combination/README.md)
- [two alerts to SMS](two-alerts-to-sms/README.md)
- [Upload pdf to google drive](upload-pdf-to-google-drive/README.md)
- [Email infrastructure](email-infrastructure/README.md)

## Create Your Own

1. Create a fork of this repo.
2. Add the exported YML with variables where needed such as email address, username, etc. See examples. Ensure your template is either filled out with correct key variables so the CLI can automatically fill in automatically, or provide enough documentation for others to be able to properly import and use your template. 
3. Supply an appropriate description like what does the template hope to accomplish, what are the possible use cases, etc. 
4. Add folder path to `index.js` so others can make use of your template from within the CLI.
5. Submit PR and await review/merge!

Please ensure all contributions align with our [CODE OF CONDUCT](/CODE_OF_CONDUCT.md) and [contributor guidelines](/CONTRIBUTING.md)