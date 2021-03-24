# Workflow Variables

## Intro

In workflows there are multiple variables that are passed down to the built in parser. In mailscript we use handlebars to allow you to substitute text in for processed variables. If you are unfamiliar with handlbars I'd suggest you read up on it [here](https://handlebarsjs.com/)

Some example handlebars syntax

`
My subject is {{subject}}
`

Assuming the variable subject is not undefined and defined as "did you receive my email?"

The processed output would look like: "My subject is did you receive my email?"


## Available variables

We provide a couple of different out of the box variables, which can be used in the body section of the action in your workflow. These variables will be available regardless of what integration, or trigger is used. Additional variables may be supplied depending on what integration is used.

| Name      | Description |
| ----------- | ----------- |
| `msg.text`      | Body of the email in the pipeline |
| `msg.html`      | HTML body of the email |
| `msg.subject`   | Subject line of the email |
| `msg.attachments`   | List of attachments in the email |


#### YML Example

<img src="/images/var_example_yml.png"/>

This example was taken from the [annotated workflow example](https://github.com/mailscript/cli/blob/main/docs/docs/cli/annotated-workflow.yml)

#### CLI Example
Or, if you are using the CLI:

Forwarding an email
```sh
mailscript actions:add --from=MyEmail@mailscript.com --forward=john@example.com --subject="{{msg.subject}}" --text="The body of the email is {{msg.text}}"
```

Sending a SMS message
Note: This will require you to verify the sms number used ahead of time or this will not be able to receive SMS messages upon execution of the action.
```sh
mailscript actions:add --sms=1235555000 --text "The body of the email is {{msg.text}}"
```