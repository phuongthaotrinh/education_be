import Joi from 'joi'
import { IStudentRemark } from '../../types/student.type'

export const validateNewStudentRemark = (payload: Omit<IStudentRemark, '_id'> | Array<Omit<IStudentRemark, '_id'>>) => {
	const schema = Joi.object({
		student: Joi.string().required(),
		schoolYear: Joi.string().required(),
		conduct: Joi.string().required(),
		proficiency: Joi.string().required(),
		isQualified: Joi.boolean().required(),
		remarkedBy: Joi.string().required()
	})

	const arraySchema = Joi.array().items(schema)
	return Array.isArray(payload) ? arraySchema.validate(payload) : schema.validate(payload)
}
