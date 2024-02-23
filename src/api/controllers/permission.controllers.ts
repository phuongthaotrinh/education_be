import { Request, Response } from 'express'
import createHttpError from 'http-errors'
import { isValidObjectId } from 'mongoose'
import { UserRoleEnum } from '../../types/user.type'
import * as PermissionService from '../services/permission.service'
import { validatePermissionData } from '../validations/permission.validation'
import { HttpStatusCode } from '../../configs/statusCode.config'
import useCatchAsync from '../../helpers/useCatchAsync'

//* [GET] /api/permission?role="Role" (get permissions by role)
export const getPermissionByRole = useCatchAsync(async (req: Request, res: Response) => {
	const role = req.query._role as UserRoleEnum
	if (!role) throw createHttpError.BadRequest('Missing parameter: role')
	if (!Object.values(UserRoleEnum).includes(role))
		throw createHttpError.BadRequest(`User's role parameter must be one of these: ${Object.values(UserRoleEnum)}`)
	const permissions = await PermissionService.getPermissionByRole(role)
	if (!permissions) throw createHttpError.NotFound('Permission not found')
	return res.status(HttpStatusCode.OK).json(permissions)
})

//* [POST] /api/permission (create permission)
export const createPermission = useCatchAsync(async (req: Request, res: Response) => {
	const { error } = validatePermissionData(req.body)
	if (error) throw createHttpError.BadRequest(error.message)
	const newPermission = await PermissionService.createPermission(req.body)
	if (!newPermission) throw createHttpError.BadRequest('Permission not created!')
	return res.status(HttpStatusCode.CREATED).json(newPermission)
})

//* [DELETE] /api/permission/:id?option='Option' (delete permission)
export const deletePermission = useCatchAsync(async (req: Request, res: Response) => {
	let result
	const { id } = req.params
	const option = req.query._option || 'soft' //default option is soft
	if (!isValidObjectId(id)) throw createHttpError.BadRequest('Invalid ID!')
	switch (option) {
		case 'soft':
			result = await PermissionService.deletePermission(id)
			break
		case 'force':
			result = await PermissionService.forceDeletePermission(id)
			break
		default:
			throw createHttpError.BadRequest('Invalid query')
	}

	return res.status(HttpStatusCode.OK).json(result)
})

//* [PUT] /api/permisison/restore/:id (restore permission)
export const restoreDeletedPermission = useCatchAsync(async (req: Request, res: Response) => {
	const id: string = req.params.id
	if (!id || !isValidObjectId(id)) throw createHttpError.BadRequest('Invalid ID!')
	const result = await PermissionService.restoreDeletedPermission(id)
	if (!result) throw createHttpError.NotFound('Permission not found')
	return res.status(HttpStatusCode.CREATED).json(result)
})

///* [PUT] /api/permission/:id (update permission)
export const updatePermission = useCatchAsync(async (req: Request, res: Response) => {
	const { id } = req.params
	const data = req.body
	const { error } = validatePermissionData(data)
	if (!id) throw createHttpError.BadRequest('Missing ID parameter')
	if (!isValidObjectId(id)) throw createHttpError.BadRequest('Invalid ID')
	if (error) throw createHttpError.BadRequest(error.message)
	const updatedPermission = await PermissionService.updatePermission(id, data)
	if (!updatedPermission) throw createHttpError.NotFound('Permission not found')
	return res.status(HttpStatusCode.OK).json(updatedPermission)
})
