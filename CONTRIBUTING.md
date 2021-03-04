# Contributing

Want to hack on mailscript? Awesome! Here are instructions to get you started.
They are not perfect yet. Please let us know what feels wrong or incomplete.

The mailscript CLI is an Open Source project and we welcome contributions of all sorts.
There are many ways to help, from reporting issues, contributing code, and
helping us improve our community.

### Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Contributing](#contributing)
    - [Table of Contents](#table-of-contents)
    - [Security Issues](#security-issues)
    - [Community Guidelines](#community-guidelines)
      - [Moderation](#moderation)
    - [Reporting Issues](#reporting-issues)
    - [Implementation Design](#implementation-design)
    - [Community Improvement](#community-improvement)
    - [A small note on licensing year](#a-small-note-on-licensing-year)
    - [Translations](#translations)
      - [Linting](#linting)
    - [Creating Custom Templates](#creating-custom-templates)
    - [Submitting a PR](#submitting-a-pr)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Security Issues

The mailscript and their implementations are still in heavy development. This means that there may be problems in our protocols, or there may be mistakes in our implementations. We take security vulnerabilities very seriously. If you discover a security issue, please bring it to our attention right away!

If you find a vulnerability that may affect live deployments -- for example, expose a remote execution exploit -- please send your report privately to [team@mailscript.org](mailto:team@mailscript.org?subject=Security). Please DO NOT file a public issue.

If the issue is a protocol weakness or something not yet deployed, just discuss it openly.

### Community Guidelines

We want to keep the mailscript community awesome, growing and collaborative. We need your help to keep it that way. To help with this we've come up with some general guidelines for the community as a whole:

- Be nice: Be courteous, respectful and polite to fellow community members: no regional, racial, gender, or other abuse will be tolerated. We like nice people way better than mean ones!

- Encourage diversity and participation: Make everyone in our community feel welcome, regardless of their background and the extent of their contributions, and do everything possible to encourage participation in our community.

- Keep it legal: Basically, don't get anybody in trouble. Share only content that you own, do not share private or sensitive information, and don't break laws.

- Stay on topic: Make sure that you are posting to the correct channel and avoid off-topic discussions. Remember when you update an issue or respond to an email you are potentially sending to a large number of people. Please consider this before you update. Also remember that nobody likes spam.

There is also a more extensive [Code of conduct](CODE_OF_CONDUCT.md) which we follow.

#### Moderation

In cases where community members transgress against the values above or in the Code, members of the mailscript Community Moderation team will use a three-strike warning system, where the aggressor will be warned twice before they are permanently excluded from mailscript community spaces. This code applies to Gitter, IRC, and GitHub, and any other future space that the mailscript community uses for communication. For interactions between mailscript community members outside of this space, the code also applies if the interactions are reported and deemed to be interfering with community members safely working on mailscript together. Moderation conversations, where more serious than simple warnings, will occur in private repositories or by email to ensure anonymity for reporters, and to ensure the safety of the moderators. To report an instance, please see the emails in the [Code of Conduct](CODE_OF_CONDUCT.md).

### Reporting Issues

If you find bugs, mistakes, inconsistencies in the mailscript specs, code or
documents, please let us know by filing an issue at the appropriate issue
tracker. No issue is too small.

### Implementation Design

When considering design proposals for implementations, we are looking for:

- A description of the problem this design proposal solves
- Discussion of the tradeoffs involved
- Discussion of the proposed solution

### Community Improvement

The mailscript community requires maintenance of various "public infrastructure" resources. These include documentation, GitHub repositories, CI build bots, and more. There is also helping new users with questions, spreading the word about mailscript, and so on.

### A small note on licensing year

Please don't update the year in the license files. Our policy is:

- Don't remove dates already in notices.
- Don't bother adding dates in new notices.
- Don't bother updating years in notices.

Thanks.

### Translations

This community moves very fast, and documentation swiftly gets out of date. If you would like to add a translation, please open an issue and ask the project captain for a given repository before filing a pull request, so that we do not waste efforts.

If anyone has any issues understanding the English documentation, please let us know! If you would like to do so privately, please email [@team](mailto:team@mailscript.org). We are very sensitive to language issues, and do not want to turn anyone away from hacking because of their language.

#### Linting

When contributing code, please "lint first and ask questions later." We use https://standardjs.com to lint our code.

1. Install [`prettier`](https://prettier.io/):

```sh
$ npm i -D prettier # npm install --save-dev prettier
```

1. Add the `lint` configurations as a file under root `.prettierrc`.

```json
{
  "semi": false,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

3. Run `prettier --write` to fix current issues.

```sh
$ npx prettier --write "./src/**/*.{ts,tsx,js,jsx}"
```

4. Run the linter.

```
$ npx prettier --check "./src/**/*.{ts,tsx,js,jsx}"
```

### Creating Custom Templates

We accept community contributions such as workflow templates. 
See [templates folder readme](templates/templates.md) for proper guide on submitting your template. Community templates should align with our [CODE OF CODUCT](CODE_OF_CONDUCT.md) and guidelines layed out in this document.

### Submitting a PR

When submitting a PR, keep these things in mind:

* **This is open source.** We're working on it! We try to get to PRs as often as we can, but if we don't respond for a few days, feel free to politely ping.
* **Add tests!** The more, the better. We aim for 110% code coverage for testing. Turn your tests up to 11.
* **Lint first, ask questions later.** When submitting a PR (or creating a new repository), please adhere to the [`standard`](https://standardjs.com/) style. This helps us cut down on bike shedding immensely.
* **Open an issue to discuss big PRs _before_ making them.** We don't want your work to be undercut by a simple workaround we could have implemented before! Discussion is the best way to ensure you're on the right track.