import { Model, ObjectId } from 'mongoose'
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export enum UserGenderEnum {
	MALE = 'Nam',
	FEMALE = 'Nữ'
}

export enum UserRoleEnum {
	HEADMASTER = 'Headmaster',
	TEACHER = 'Teacher',
	PARENTS = 'Parents'
}

export interface IUser extends Document {
	_id: string | ObjectId
	email: string
	displayName: string
	password?: string
	picture: string
	address: string
	dateOfBirth: Date
	gender: UserGenderEnum
	phone: string
	role: UserRoleEnum
	eduBackground?: {
		universityName: string
		graduatedAt: Date
		qualification: string
	}
	employmentStatus?: boolean
	isVerified: boolean
	verifyPassword: (password: string) => boolean
}

export interface IUserDocument extends IUser, Omit<SoftDeleteDocument, '_id'> {}
export type TUserModel = Model<IUserDocument>
export type TSoftDeleteUserModel = SoftDeleteModel<IUserDocument, TUserModel>
