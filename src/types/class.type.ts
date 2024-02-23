import { Model, ObjectId, SortOrder } from 'mongoose'
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'
import { IUser } from './user.type'

export interface IClass {
	_id: ObjectId
	grade: 1 | 2 | 3 | 4 | 5
	className: string
	headTeacher: ObjectId | Pick<IUser, '_id' | 'displayName' | 'email' | 'phone'> | string
	students: Array<ObjectId>
	totalStudents?: number
	isTemporary: boolean
}
export type TClassSortOption = {
	className?: SortOrder
	grade?: SortOrder
	createdAt?: SortOrder
	updatedAt?: SortOrder
}
export interface IClassDocument extends Omit<SoftDeleteDocument, '_id'>, IClass {}
export type TClassModel = Model<IClassDocument>
export type TSoftDeleteClassModel = SoftDeleteModel<IClassDocument, TClassModel>
