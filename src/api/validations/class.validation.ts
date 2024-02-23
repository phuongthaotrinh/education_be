import Joi from 'joi'
import { IClass } from '../../types/class.type'

export const validateClassData = (data: Omit<IClass, '_id'>) => {
	const regexClassName = new RegExp(`^${data.grade}[a-zA-Z]$`)
	const schema = Joi.object({
		className: Joi.string().required().pattern(regexClassName),
		headTeacher: Joi.string().required(),
		grade: Joi.number().required().valid(1, 2, 3, 4, 5)
	})
	return schema.validate(data)
}

export const validateArrayOfClassData = (data: Omit<IClass, '_id'>) => {
	const regexClassName = new RegExp(`^${data.grade}[a-zA-Z]$`)
	const schema = Joi.array().items(
		Joi.object({
			className: Joi.string().required().pattern(regexClassName),
			headTeacher: Joi.string().required(),
			grade: Joi.number().required().valid(1, 2, 3, 4, 5)
		})
	)

	return schema.validate(data)
}

export const validateClassEditData = (data: Partial<Omit<IClass, '_id'>>) => {
	const regexClassName = data.grade ? new RegExp(`^${data.grade}[a-zA-Z]$`) : /^[1-5][a-zA-Z]$/
	const schema = Joi.object({
		className: Joi.string().required().pattern(regexClassName).optional(),
		headTeacher: Joi.string().required().optional(),
		grade: Joi.number().required().valid(1, 2, 3, 4, 5).optional()
	})
	return schema.validate(data)
}
