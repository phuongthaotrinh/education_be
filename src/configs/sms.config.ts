import 'dotenv/config'

import { AuthInterface } from '@vonage/auth'
import { Vonage } from '@vonage/server-sdk'
import 'dotenv/config'
import path from 'path'

const vonage = new Vonage({
	apiKey: process.env.SMS_API_KEY,
	apiSecret: process.env.SMS_API_SECRET,
	applicationId: process.env.SMS_API_APP_ID,
	privateKey: path.resolve('/private.key')
} as AuthInterface)

export default vonage
