import Joi from 'joi'
import { IAttendance } from '../../types/attendance.type'

export const validateAttedancePayload = (payload: Array<Omit<IAttendance, '_id'>>) => {
	const schema = Joi.array().items(
		Joi.object({
			student: Joi.string().required(),
			isPresent: Joi.boolean().required(),
			reason: Joi.string().when('isPresent', {
				is: Joi.equal(true),
				then: Joi.forbidden()
			})
		})
	)
	return schema.validate(payload)
}
