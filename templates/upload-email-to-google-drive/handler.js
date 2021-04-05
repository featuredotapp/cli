const express = require('express')
const cors = require('cors')
const { google } = require('googleapis')

const { Readable } = require('stream')

const SCOPES = ['https://www.googleapis.com/auth/drive.file']

async function driveAuth(access_token) {
  const oAuth2Client = new google.auth.OAuth2()
  oAuth2Client.setCredentials({
    access_token,
    scope: JSON.stringify(SCOPES),
  })
  await oAuth2Client.getAccessToken()
  return google.drive({
    version: 'v3',
    auth: oAuth2Client,
  })
}

function getFolderId(drive, folderName, rootFolderId) {
  return new Promise((resolve, fail) => {
    let query =
      "name='" +
      folderName +
      "' and mimeType='application/vnd.google-apps.folder' and trashed = false"

    if (rootFolderId) {
      query += "and '" + rootFolderId + "' in parents"
    }

    drive.files.list(
      {
        q: query,
      },
      (err, res) => {
        if (res) {
          const {
            data: { files },
          } = res

          if (files.length > 1) {
            console.log(
              'warning: more than 1',
              folderName,
              'found... using a random one',
            )
          }

          if (files.length) {
            resolve(files[0].id)
            return
          }
        }
        drive.files.create(
          {
            resource: {
              name: folderName,
              mimeType: 'application/vnd.google-apps.folder',
              parents: [rootFolderId],
            },
            fields: 'id',
          },
          (err, res) => {
            if (err) {
              fail(err)
            } else {
              if (!res.data) {
                fail(new Error('Could not create folder: ' + folderName))
              }

              const {
                data: { id },
              } = res

              if (id) {
                resolve(id)
              }

              fail('could not find or create folder')
            }
          },
        )
      },
    )
  })
}

function bufferToStream(binary) {
  return new Readable({
    read() {
      this.push(binary)
      this.push(null)
    },
  })
}

const write = async (req, res) => {
  console.log('Write')

  try {
    const { googleDriveAuth, content, driveStoragePath } = req.body

    if (!driveStoragePath || !content || !googleDriveAuth) {
      console.log('Missing fields')
      res.status(400).send({
        timestamp: Date.now(),
        status: 'not ok',
        error: 'Missing required fields',
      })
      return
    }

    console.log('Data to be written exists')

    const drive = await driveAuth(googleDriveAuth)

    console.log('Authenticated')

    const path = driveStoragePath.split('/')

    let folderId

    for (const folder of path) {
      folderId = await getFolderId(drive, folder, folderId)
    }

    console.log('Folder ID:', folderId)

    const filePromises = []
    const [filename, contentType] = [new Date().toString(), 'application/json']

    console.log('Uploading:', filename)
    const contentAsBuffer = Buffer.from(content)

    filePromises.push(
      new Promise((resolve, fail) => {
        drive.files.create(
          {
            resource: {
              name: filename,
              parents: [folderId],
            },
            media: {
              mimeType: contentType,
              body: bufferToStream(attachmentAsBuffer),
            },
            fields: 'id',
          },
          (err, resp) => {
            if (err) {
              console.log('Google Upload failed', err)
              fail('Failed to upload "' + filename + '":', err)
            } else {
              console.log('Google Upload succeeded', filename)
              resolve('Uploaded:', filename)
            }
          },
        )
      }),
    )

    await Promise.all(filePromises)

    console.log('All files uploaded')

    res.status(200).send({
      timestamp: Date.now(),
      status: 'ok',
    })
  } catch (err) {
    console.log('Write error:', err)
    res.status(400).send({
      timestamp: Date.now(),
      status: 'not ok',
      error: err.message,
    })
  }
}

const app = express()
app.post('/', cors(), express.json(), write)
app.use('*', (req, res) => res.status(404).send('not found'))

module.exports = app
