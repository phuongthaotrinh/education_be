import { Model, PaginateModel } from 'mongoose'
import { ObjectId } from 'mongoose'
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'
import { IUser } from './user.type'

export interface ILearningMaterial {
	_id: string
	subject: ObjectId
	fileId: string
	title: string
	fileSize: number
	mimeType: string
	downloadUrl: string
	uploadedBy: string | ObjectId | Pick<IUser, '_id' | 'displayName'>
}
export interface ILearningMaterialDocument extends ILearningMaterial, Omit<SoftDeleteDocument, '_id'> {}
export type TLearningMaterialModel = Model<ILearningMaterial>
export type TSoftDeleteModel = SoftDeleteModel<ILearningMaterialDocument, TLearningMaterialModel>
export type TPaginateModel = PaginateModel<ILearningMaterial>
