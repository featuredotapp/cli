const notifier = require('node-notifier')
const path = require('path')
const process = require('process')

const GITHUB_ICON = '' // FIXME add icon

function main(emailData) {
  console.log('Email received, running notification...')

  if (
    !emailData.github ||
    emailData.github.type !== 'action' ||
    !emailData.github.pr
  ) {
    return
  }
  const { organization, repository, name } = emailData.github
  const { buildFailed, commit } = emailData.github.pr

  if (
    organization == null ||
    repository == null ||
    buildFailed == null ||
    name == null ||
    commit == null
  ) {
    return
  }

  if (buildFailed) {
    notifier.notify({
      title: 'GitHub Action Run Failed\nvia Mailscript',
      message:
        'PR ' +
        organization +
        '/' +
        repository +
        ' - ' +
        name +
        ' (' +
        commit +
        ')',
      // icon: path.join(__dirname, GITHUB_ICON),
      sound: true,
      wait: false,
    })
  }
}

main(JSON.parse(process.env.payload))
