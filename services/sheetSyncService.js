import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

// ✅ Fields to export
const COMPETITION_FIELDS = ['name', 'RegNo', 'department', 'batch', 'competitionTitle'];
const EVENT_FIELDS = ['name', 'RegNo', 'department', 'batch', 'title'];

// ✅ Fetch data from MongoDB
async function fetchDataFromCollection(collectionName, requiredFields) {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db();
  const collection = db.collection(collectionName);

  const projection = requiredFields.reduce((acc, key) => {
    acc[key] = 1;
    return acc;
  }, { _id: 0 });

  const data = await collection.find({}, { projection }).toArray();
  await client.close();

  if (!data.length) return [];

  const headers = requiredFields;
  const values = data.map(doc => headers.map(h => doc[h] || ''));
  return [headers, ...values];
}

export async function fetchCompetitionData() {
  return fetchDataFromCollection('competitionconfirmations', COMPETITION_FIELDS);
}

export async function fetchEventData() {
  return fetchDataFromCollection('eventconfirmations', EVENT_FIELDS);
}

//  Ensure Google Sheet tab exists
async function ensureSheetExists(sheets, spreadsheetId, sheetName) {
  const metadata = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetExists = metadata.data.sheets.some(sheet => sheet.properties.title === sheetName);

  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      },
    });
    console.log( `Sheet "${sheetName}" created in spreadsheet: ${spreadsheetId}`);
  }
}

// Upload data to Google Sheet
export async function uploadToSheet(values, spreadsheetId, sheetName = 'Sheet1', credentialPath = 'credentials.json') {
  const absoluteCredentialPath = path.resolve(__dirname, credentialPath); // resolves relative to this file

  const auth = new google.auth.GoogleAuth({
    keyFile: absoluteCredentialPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  await ensureSheetExists(sheets, spreadsheetId, sheetName);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range:`${sheetName}!A1`,
    valueInputOption: 'RAW',
    resource: {
      values,
    },
  });

  console.log(`[${new Date().toISOString()}]  Sheet "${sheetName}" in ${spreadsheetId} updated with ${values.length - 1} entries`);
}

// Sync all sheets
export default async function syncAllSheets() {
  try {
    const competitionData = await fetchCompetitionData();
    if (competitionData.length > 1) {
      await uploadToSheet(
        competitionData,
        process.env.COMPETITION_SHEET_ID,
        'Sheet1',
        process.env.COMPETITION_CREDENTIALS
      );
    } else {
      console.log('No competition confirmations to sync.');
    }

    const eventData = await fetchEventData();
    if (eventData.length > 1) {
      await uploadToSheet(
        eventData,
        process.env.EVENT_SHEET_ID,
        'Sheet1',
        process.env.EVENT_CREDENTIALS
      );
    } else {
      console.log('No event confirmations to sync.');
    }

  } catch (err) {
    console.error('Error syncing sheets:', err.message);
  }
}