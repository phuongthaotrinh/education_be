import mongoose from 'mongoose'
import mongooseAutoPopulate from 'mongoose-autopopulate'
import mongooseDelete from 'mongoose-delete'
import {
	IPermission,
	IPermissionDocument,
	TSoftDeletePermissionModel,
	PermissionActionsEnum
} from '../../types/permission.type'
import { UserRoleEnum } from '../../types/user.type'

const PermissionSchema = new mongoose.Schema<IPermission>({
	role: {
		type: String,
		required: true,
		trim: true,
		enum: UserRoleEnum
	},
	type: {
		type: String,
		required: true,
		trim: true
	},

	permissions: [
		{
			type: {
				type: String,
				uppercase: true
			},
			allowedActions: [
				{
					type: String,
					enum: PermissionActionsEnum
				}
			]
		}
	]
})

PermissionSchema.plugin(mongooseAutoPopulate)
PermissionSchema.plugin(mongooseDelete, {
	deletedAt: true,
	overrideMethods: true
})

const PermissionModel: TSoftDeletePermissionModel = mongoose.model<IPermissionDocument, TSoftDeletePermissionModel>(
	'Permissions',
	PermissionSchema
)

export default PermissionModel
