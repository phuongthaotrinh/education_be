import SMTPTransport from 'nodemailer/lib/smtp-transport'
import transporter from '../../configs/nodemailer.config'

export const sendMail = async ({ to, subject, html }: { to: string; subject: string; html: string }) =>
	await transporter.sendMail(
		{
			from: {
				address: process.env.AUTH_EMAIL!,
				name: 'Tiểu học Yên Nghĩa'
			},
			to: to,
			subject: subject,
			html: html
		},
		(err: Error | null, info: SMTPTransport.SentMessageInfo): void => {
			if (err) console.log('Failed to send mail.\nError: ', err.message)
			else console.log(info.response)
		}
	)
