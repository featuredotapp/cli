const express = require('express')
const cors = require('cors')
const flatten = require('flat')
const { GoogleSpreadsheet } = require('google-spreadsheet')

function atob(str) {
  return Buffer.from(str, 'base64').toString()
}

async function spreadsheetAuth(doc, credsClientEmail, credsPrivateKey) {
  return await doc.useServiceAccountAuth({
    client_email: atob(credsClientEmail),
    private_key: atob(credsPrivateKey),
  })
}

const write = async (req, res) => {
  console.log('Write')
  try {
    const { row: rowRaw, credsClientEmail, credsPrivateKey, docId } = req.body
    if (!docId || !credsClientEmail || !credsPrivateKey) {
      console.log('Missing fields')
      res.status(400).send({
        timestamp: Date.now(),
        status: 'not ok',
        error: 'Missing required fields',
      })
      return
    }
    if (!rowRaw) {
      console.log('Write error: no row data')
      res.status(400).send({
        timestamp: Date.now(),
        status: 'not ok',
        error: 'Please include data in row property',
      })
      return
    }
    console.log('Data to be written exists')
    const rowFlat = flatten(rowRaw)
    const row = Object.entries(rowFlat).reduce((p, [k, v]) => {
      return {
        ...p,
        [k]:
          v === null
            ? ''
            : Array.isArray(v)
            ? v.join(',')
            : typeof v === 'object'
            ? Object.entries(v)
                .map(([k, v]) => `${k}: ${v}`)
                .join(',')
            : v,
      }
    }, {})
    console.log('Flattened data')
    const doc = new GoogleSpreadsheet(atob(docId))
    console.log('Got doc')
    await spreadsheetAuth(doc, credsClientEmail, credsPrivateKey)
    console.log('Authenticated')
    await doc.loadInfo()
    console.log('Loaded info')
    const sheet = doc.sheetsByIndex[0]
    // empty headers?
    // throws if so
    console.log('Resolving headers')
    try {
      await sheet.loadHeaderRow()
    } catch (err) {
      const hs = Object.keys(row)
      await sheet.resize({
        rowCount: 3,
        columnCount: hs.length,
      })
      await sheet.setHeaderRow(hs)
    }
    console.log('Headers in place')
    await sheet.loadHeaderRow()
    const headers = sheet.headerValues
    const newHeaders = Object.keys(row).reduce(
      (p, c) => [...p, ...(headers.includes(c) ? [] : [c])],
      [],
    )
    console.log(
      `New headers? ${newHeaders.length ? `yes (${newHeaders.length})` : 'no'}`,
    )
    if (newHeaders.length) {
      const rows = await sheet.getRows()
      const updatedHeaders = [...headers, ...newHeaders]
      await sheet.resize({
        rowCount: rows.length + 3,
        columnCount: updatedHeaders.length,
      })
      await sheet.setHeaderRow(updatedHeaders)
      console.log('New headers in place')
    }
    await sheet.addRow(row)
    console.log('Row added')
    await sheet.saveUpdatedCells()
    console.log('Sheet updated')
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

const read = async (req, res) => {
  console.log('Read')
  try {
    const { credsClientEmail, credsPrivateKey, docId } = req.query
    if (!docId || !credsClientEmail || !credsPrivateKey) {
      console.log('Missing fields')
      res.status(400).send({
        timestamp: Date.now(),
        status: 'not ok',
        error: 'Missing required fields',
      })
      return
    }
    const doc = new GoogleSpreadsheet(atob(docId))
    console.log('Got doc')
    await spreadsheetAuth(doc, credsClientEmail, credsPrivateKey)
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    await sheet.loadCells()
    await sheet.loadHeaderRow()
    const headers = sheet.headerValues
    const rows = await sheet.getRows()
    const data = rows.map((row) =>
      headers.map((h) => ({ [h]: !!row[h] ? row[h] : '' })),
    )
    res.status(200).send({
      timestamp: Date.now(),
      headers,
      data,
    })
  } catch (err) {
    console.log('Read error:', err)
    res.status(400).send({
      timestamp: Date.now(),
      status: 'not ok',
      error: err.message,
    })
  }
}

const app = express()
app.post('/', cors(), express.json(), write)
app.get('/', cors(), read)
app.use('*', (req, res) => res.status(405).send('not ok'))

module.exports = app
