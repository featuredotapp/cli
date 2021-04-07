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


### Records:

```
name: _dmarc
type: TXT
values: "v=DMARC1; p=quarantine; rua=mailto:1a8046a6@mxtoolbox.dmarc-report.com; ruf=mailto:1a8046a6@forensics.dmarc-report.com"
```
```
name: dkim._domainkey
type: TXT
value: "v=DKIM1;k=rsa;t=s;s=email;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwHkMPooK9E2QFJNy5KZkLLnxrm8CzwpJ3g2n/MZnm8+wuh8SLZfCQrOx32QyJpeTi6QYw8bIT/EbQIjJ/2hQJBelhgvq2gUTt8SazcWlPAUUXErUW8kdUhNUpdo43QYyIxBgJfNyPvBeX/8J7MPRfDwQP95D+zd3qt35+QF3g1rJwXIXBc6HT3G" " WP1DwDRLTFc8fy3fq7CKI7Xtq6NUlB2ojbB/6rhUVfk3GycVnEMs1LVU8kRFnz/G3B6rTkULlYoELyoKZbFSdl7jsvmLyFoFtLQS4/OS4jINNoTPvkjSq4c3AUfZsXW+qQTbZcku3m2Aa7Ap2Si3j8Nu+9wTPPQIDAQAB"
```
```
name: @
type: TXT
value: "ms_verify=(Insert the verification code provided by the CLI here)"
```

Note 1: These values might change in the future, but we will try our best to keep you up to date on any changes.

Note 2: There might be additional records that will be required... Please follow what is provided by the CLI over what provided in this doc. Ensuring your domain is setup correctly is your responsibility.

Keep in mind the `ms_verify` value is unique to your account, in the event the verification code is removed from the domain you may lose access to the workspace attached with your domain. 

Feel free to reach out to us over [discord](https://discord.gg/US24HAVYq2) if something is missing in the docs or need assistance setting up your domain.


Finally, your DNS settings should look something similar to this:

<img src="/images/example_dns_config.png"/>
In the screenshot above we are using Google domains. The console for your domain might look a bit different.

## Commands

TODO when commands are implemented