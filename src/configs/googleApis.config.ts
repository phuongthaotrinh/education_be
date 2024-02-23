import { drive_v3, google } from 'googleapis'
import 'dotenv/config'

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_API_REFRESH_TOKEN, REDIRECT_URI } = process.env

const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI)

// Sets the auth credentials.
oauth2Client.setCredentials({
	refresh_token: <string>GOOGLE_API_REFRESH_TOKEN
})
// Get a non-expired access token, after refreshing if necessary
oauth2Client.getAccessToken().catch((error) => console.log(`[ERROR] ::: <Google API> ${error.message}`))

const drive: drive_v3.Drive = google.drive({
	version: 'v3',
	auth: oauth2Client
})

const baseDownloadUrl = 'https://drive.google.com/uc?export=download&id='

export { oauth2Client, baseDownloadUrl, drive }
