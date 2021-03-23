# Custom domain support

As part of mailscript we offer the ability to use your own domain for sending and receiving emails.

For this to work correctly there are a couple of things you will need.

* A domain name
* A mailscript account
* Basic understanding of DNS configuration

The configuration flow goes as follows:

1. Create mailscript account (if you don't have one already)
2. Set the correct MX, DMARC and DKIM values in your domain configuration panel. (More on this later)
3. Run `mailscript domains:add example.org`; After this you will be prompted to add a verification code to your domain
4. After sometime has passed you can run `mailscript domains:verify example.org` to check your domain manually... This process will happen automatically, so no need to rerun this command over and over until the domain has been verified. Once verification is complete you should see all active domains available when running `mailscript domains:list`
5. Done! You can now start creating addresses using the `workspace` command similar to any other workspace.

An example verification code looks like:

`
ms_verify=76bc4d64-9389-4fbe-86d6-61a90227c74d
`

Keep in mind these codes are unique to your account, and in the event the verification code is removed you may lose access to the workspace attached with your domain. 


## Commands

TODO when commands are implemented