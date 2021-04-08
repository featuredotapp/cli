export const staticDns = [
  {
    type: 'TXT',
    name: '_dmarc',
    value:
      '"v=DMARC1; p=quarantine; rua=mailto:1a8046a6@mxtoolbox.dmarc-report.com; ruf=mailto:1a8046a6@forensics.dmarc-report.com"',
  },
  {
    type: 'TXT',
    name: 'dkim._domainkey',
    value:
      '"v=DKIM1;k=rsa;t=s;s=email;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwHkMPooK9E2QFJNy5KZkLLnxrm8CzwpJ3g2n/MZnm8+wuh8SLZfCQrOx32QyJpeTi6QYw8bIT/EbQIjJ/2hQJBelhgvq2gUTt8SazcWlPAUUXErUW8kdUhNUpdo43QYyIxBgJfNyPvBeX/8J7MPRfDwQP95D+zd3qt35+QF3g1rJwXIXBc6HT3G" " WP1DwDRLTFc8fy3fq7CKI7Xtq6NUlB2ojbB/6rhUVfk3GycVnEMs1LVU8kRFnz/G3B6rTkULlYoELyoKZbFSdl7jsvmLyFoFtLQS4/OS4jINNoTPvkjSq4c3AUfZsXW+qQTbZcku3m2Aa7Ap2Si3j8Nu+9wTPPQIDAQAB"',
  },
]
