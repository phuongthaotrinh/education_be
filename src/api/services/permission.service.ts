import { IPermission } from '../../types/permission.type'
import PermissionModel from '../models/permission.model'

export const createPermission = async (permission: IPermission & Partial<IPermission>) =>
	await new PermissionModel(permission).save()

export const getPermissions = async () => await PermissionModel.find()

export const getPermissionByRole = async (role: string) => await PermissionModel.find({ role: role })

export const deletePermission = async (permissionID: string) => {
	await PermissionModel.delete({ _id: permissionID })
	return {
		message: 'The permission has been successfully moved to the trash',
		statusCode: 200
	}
}

export const forceDeletePermission = async (permissionID: string) => {
	await PermissionModel.deleteOne({ _id: permissionID })

	return {
		message: 'The permission has been successfully deleted permanently',
		statusCode: 200
	}
}

export const restoreDeletedPermission = async (permissionID: string) => {
	await PermissionModel.restore({ _id: permissionID })

	return {
		message: 'The permission has been successfully restored',
		statusCode: 200
	}
}

export const updatePermission = async (permissionID: string, permission: IPermission & Partial<IPermission>) => {
	return await PermissionModel.findOneAndUpdate({ _id: permissionID }, permission, {
		new: true
	})
}
