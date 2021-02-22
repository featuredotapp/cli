const express = require('express')
const cors = require('cors')
const { google } = require('googleapis')

const { Readable } = require('stream')
const readline = require('readline')
const process = require('process')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      /*fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });*/
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}

function driveAuth(credsClientId, credsPrivateKey) {
  return new Promise((resolve,fail) => {
    const oAuth2Client = new google.auth.OAuth2(
      credsClientId,
      credsPrivateKey,
      'https://mailscript.com', // redirect to mailscript.com for now
    )
    getAccessToken(oAuth2Client, (auth) => resolve(google.drive({
      version: 'v3',
      auth,
    })))
  })
}

function getFolderId(drive, folderName, rootFolderId) {
  return new Promise((resolve, fail) => {
    let query = "name='" + folderName + "' and mimeType='application/vnd.google-apps.folder' and trashed = false"
    if (rootFolderId) {
      query += "'" + rootFolderId + "' in parents"
    }
    drive.files.list({
      q: query,
    }, (err, res) => {
      if (res) {
        const { data: { files } } = res
        if (files.length > 1) {
          console.log('warning: more than 1', folderName, 'found... using a random one')
        }
        if (files.length) {
          resolve(files[0].id)
          return
        }
      }
      drive.files.create({
        resource: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [ rootFolderId ]
        },
        fields: 'id',
      }, (err, res) => {
        if (err) {
          fail(err)
        } else {
          if (!res.data) {
            fail(new Error('Could not create folder: ' + folderName))
          }
          const { data: { id } } = res
        if (id) {
          resolve(id)
        }
        fail('could not find or create folder')
        }
      })
    })
  })
}

const write = async (req, res) => {
  console.log('Write')
  try {
    const { credsClientId, credsPrivateKey, attachments, driveStoragePath } = req.body
    if (!driveStoragePath || !attachments || !credsClientId || !credsPrivateKey) {
      console.log('Missing fields')
      res.status(400).send({
        timestamp: Date.now(),
        status: 'not ok',
        error: 'Missing required fields',
      })
      return
    }
    if (attachments.length === 0) {
      console.log('Write error: no attached files')
      res.status(400).send({
        timestamp: Date.now(),
        status: 'not ok',
        error: 'No attachments to write',
      })
      return
    }
    console.log('Data to be written exists')
    const drive = await driveAuth(credsClientId, credsPrivateKey)
    console.log('Authenticated')

    const path = driveStoragePath.split('/')
    let folderId;
    for (const folder of path) {
      folderId = await getFolderId(drive, folder, folderId)
    }
    console.log('Folder ID:', folderId)

    const filePromises = []
    for (const { filename, content, contentType } of attachments) {
      if (contentType !== 'application/pdf' ||
        filename.endsWith('.pdf')
      ) {
        console.log(filename, 'is not a pdf document')
        continue
      }

      console.log('Uploading:', filename)
      filePromises.push(new Promise((resolve, fail) => {
        drive.files.create({
          resource: {
            name: filename,
            parents: [ folderId ],
          },
          media: {
            mimeType: contentType,
            body: Readable.from(Buffer.from(content.data).toString()),
          },
          fields: 'id',
        }, (err, resp) => {
          if (err) {
            fail('Failed to upload "' + filename + '":', err)
          } else {
            resolve('Uploaded:', filename)
          }
        })
      }))
    }
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
app.use('*', (req, res) => res.status(405).send('not ok'))

app.listen(3001)

module.exports = app
