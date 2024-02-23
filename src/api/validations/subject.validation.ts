import Joi from 'joi'
import { ISubject } from '../../types/subject.type'
import { toCapitalize } from '../../helpers/toolkit'

export const validateSubjectRequestBody = (data: Omit<ISubject, '_id'>) => {
	const schema = Joi.object({
		subjectName: Joi.string().trim().required().min(3).max(50),
		subjectCode: Joi.string().uppercase().trim().required(),
		isMainSubject: Joi.boolean().required(),
		appliedForGrades: Joi.array().items(Joi.number().valid(1, 2, 3, 4, 5)).default([1, 2, 3, 4, 5]),
		isElectiveSubject: Joi.boolean().when('isMainSubject', {
			is: Joi.boolean().equal(true),
			then: Joi.boolean().default(false)
		})
	})
	return schema.validate(data)
}

export const validateSubjectUpdateBody = (data: Partial<Omit<ISubject, '_id'>>) => {
	const schema = Joi.object({
		subjectName: Joi.string().custom(toCapitalize, 'Capitalize string value').required().min(3).max(50).optional(),
		subjectCode: Joi.string().uppercase().trim().optional(),
		isMainSubject: Joi.boolean().optional(),
		appliedForGrades: Joi.array().items(Joi.number().valid(1, 2, 3, 4, 5)).optional(),
		isElectiveSubject: Joi.boolean()
			.when('isMainSubject', {
				is: Joi.boolean().equal(true),
				then: Joi.boolean().default(false)
			})
			.optional()
	})
	return schema.validate(data)
}
