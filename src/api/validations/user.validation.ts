import Joi from 'joi'
import { IUser, UserGenderEnum } from '../../types/user.type'
import { toCapitalize } from '../../helpers/toolkit'

export const validateSigninData = (payload: Pick<IUser, 'phone' & 'password'>) => {
	const schema = Joi.object({
		phoneOrEmail: Joi.alternatives()
			.try(
				Joi.string()
					.lowercase()
					.email({
						minDomainSegments: 2,
						tlds: {
							allow: ['com']
						}
					}),
				Joi.string().alphanum().min(3).max(30)
			)
			.required()
			.error(new Error('Invalid email or userName')),

		password: Joi.string().min(6).max(32).required()
	})
	return schema.validate(payload)
}

export const validateNewTeacherData = (payload: Omit<IUser, '_id'>) => {
	const schema = Joi.object({
		email: Joi.string()
			.lowercase()
			.email({ tlds: { allow: true } })
			.regex(/^[\w.+\-]+@gmail\.com$/, { name: 'email' })
			.required()
			.messages({
				'object.regex': 'Email must be a valid Gmail address !'
			}),
		password: Joi.string().min(6).max(24),
		displayName: Joi.string().custom(toCapitalize).required(),
		address: Joi.string().required(),
		dateOfBirth: Joi.date().required(),
		phone: Joi.string()
			.pattern(/^\d{10,11}$/, { name: 'phone number' })
			.required(),
		gender: Joi.string()
			.required()
			.valid(...Object.values(UserGenderEnum)),
		eduBackground: Joi.object({
			universityName: Joi.string().custom(toCapitalize).required(),
			graduatedAt: Joi.date().required(),
			qualification: Joi.string().custom(toCapitalize).required()
		})
	})
	return schema.validate(payload)
}

export const validateNewParentsData = (payload: Omit<IUser, '_id'> | Omit<IUser, '_id'>[]) => {
	const schema = Joi.object({
		email: Joi.string()
			.lowercase()
			.email()
			.regex(/^[\w.+\-]+@gmail\.com$/, { name: 'email' })
			.required()
			.messages({
				'string.pattern.base': 'User email must be a valid Gmail address !'
			}),
		phone: Joi.string()
			.pattern(/^\d{10,11}$/, { name: 'phone number' })
			.required(),
		displayName: Joi.string().custom(toCapitalize).required(),
		address: Joi.string().required(),
		dateOfBirth: Joi.date().required(),
		gender: Joi.string().required()
	})

	const arraySchema = Joi.array()
		.items(schema)
		.unique((user1, user2) => user1.phone === user2.phone)
		.unique((user1, user2) => user1.email.toLowerCase() === user2.email.toLowerCase())

	return Array.isArray(payload) ? arraySchema.validate(payload) : schema.validate(payload)
}

export const validateUpdateUserData = (payload: Partial<IUser>) => {
	const schema = Joi.object({
		email: Joi.string()
			.email()
			.lowercase()
			.regex(/^[\w.+\-]+@gmail\.com$/, { name: 'email' })
			.optional()
			.messages({
				'string.pattern.base': 'User email must be a valid Gmail address !'
			}),
		address: Joi.string().optional(),
		displayName: Joi.string().optional(),
		dateOfBirth: Joi.date().optional(),
		phone: Joi.string()
			.pattern(/^\d{10,11}$/, { name: 'phone number' })
			.optional(),
		gender: Joi.string()
			.valid(...Object.values(UserGenderEnum))
			.optional(),
		eduBackground: Joi.object({
			universityName: Joi.string().required(),
			graduatedAt: Joi.date().required(),
			qualification: Joi.string().required()
		}).optional()
	})
	return schema.validate(payload)
}
