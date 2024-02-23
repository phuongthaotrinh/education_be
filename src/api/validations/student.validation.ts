import Joi from 'joi'
import { IStudent, StudentStatusEnum } from '../../types/student.type'
import { UserGenderEnum } from '../../types/user.type'
import { IAttendance } from '../../types/attendance.type'

// validate
export const validateReqBodyStudent = (data: Omit<IStudent, '_id'> | Omit<IStudent, '_id'>[]) => {
	const schema = Joi.object({
		class: Joi.string().required(),
		code: Joi.string().required(),
		fullName: Joi.string().required().min(6).max(100),
		gender: Joi.string()
			.valid(...Object.values(UserGenderEnum))
			.required(),
		dateOfBirth: Joi.date().required(),
		parents: Joi.string().required(),
		isPolicyBeneficiary: Joi.bool().optional(),
		status: Joi.string()
			.valid(...Object.values(StudentStatusEnum))
			.optional()
	})
	const arraySchema = Joi.array().items(schema)
	return Array.isArray(data) ? arraySchema.validate(data) : schema.validate(data)
}

export const validateAttendanceStudent = (data: Omit<IAttendance, '_id' | 'date'>) => {
	const schema = Joi.object({
		hasPermision: Joi.bool().optional(),
		reason: Joi.string().max(256).optional()
	})

	return schema.validate(data)
}

export const validateUpdateReqBodyStudent = (data: Partial<Omit<IStudent, '_id'>>) => {
	const schema = Joi.object({
		class: Joi.string().required().optional(),
		code: Joi.string().required().optional(),
		fullName: Joi.string().required().min(6).max(100).optional(),
		gender: Joi.string()
			.valid(...Object.values(UserGenderEnum))
			.required()
			.optional(),
		dateOfBirth: Joi.date().required().optional(),
		parents: Joi.string().required().optional(),
		isPolicyBeneficiary: Joi.bool().optional(),
		transferSchoolDate: Joi.date().optional(),
		dropoutDate: Joi.date().optional(),
		status: Joi.string()
			.valid(...Object.values(StudentStatusEnum))
			.optional()
	})
	return schema.validate(data)
}
