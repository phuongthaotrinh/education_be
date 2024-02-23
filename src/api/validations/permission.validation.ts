import Joi from 'joi'
import { IPermission, PermissionActionsEnum } from '../../types/permission.type'
import { UserRoleEnum } from '../../types/user.type'

export const validatePermissionData = (data: Omit<IPermission, '_id'>) => {
	const schema = Joi.object({
		role: Joi.string()
			.valid(...Object.values(UserRoleEnum))
			.required(),
		permissions: Joi.array()
			.items(
				Joi.object({
					type: Joi.string().required(),
					allowedActions: Joi.array().items(
						Joi.string()
							.valid(...Object.values(PermissionActionsEnum))
							.required()
					)
				})
			)
			.default([])
	})
	return schema.validate(data)
}
