import 'dotenv/config'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
	service: 'gmail',
	port: 465,
	auth: {
		user: process.env.AUTH_EMAIL,
		pass: process.env.AUTH_PASSWORD
	},
	tls: {
		rejectUnauthorized: false
	}
})
export default transporter
