import { SendMessageParams } from '@vonage/messages/dist/types/SendMessageParams'
import vonage from '../../configs/sms.config'

const sender = process.env.NODE_ENV?.includes('production') ? process.env.SMS_VIRTUAL_PHONE : 'Vonage APIs'

export default async ({ to, text }: { to: string; text: string }) => {
	return await vonage.sms
		.send({
		from:"Vonage APIs",
		to,
		text
			// messageType: 'text',
			// channel: 'sms',
	} as any)
		.then((value) => {
			console.log(value)
			return value
		})
		.catch((reason) => console.log(reason))
}
