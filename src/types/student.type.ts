import { Model, ObjectId, PaginateModel } from 'mongoose'
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'
import { IClass } from './class.type'
import { ISchoolYear } from './schoolYear.type'
import { IUser } from './user.type'

export interface IStudent extends Document {
	_id: ObjectId
	code: string
	fullName: string
	gender: string
	dateOfBirth: Date
	class: ObjectId | string | Partial<IClass>
	parents: ObjectId | Pick<IUser, '_id' | 'email' | 'phone' | 'displayName' | 'address'>
	status: StudentStatusEnum
	isPolicyBeneficiary?: boolean
	graduatedAt: ObjectId
	transferSchoolDate?: Date
	dropoutDate?: Date
}

export enum StudentStatusEnum {
	STUDYING = 'Đang học',
	TRANSFER_SCHOOL = 'Chuyển trường',
	DROPPED_OUT = 'Thôi học',
	WAITING_ARRANGE_CLASS = 'Chờ xếp lớp',
	GRADUATED = 'Hoàn thành chương trình tiểu học'
}

export interface IStudentRemark extends Document {
	_id: ObjectId
	student: ObjectId | Pick<IStudent, '_id' | 'fullName' | 'class'>
	schoolYear: string | ObjectId | Pick<ISchoolYear, '_id'>
	conduct: string
	proficiency: string
	isQualified: boolean
	remarkedBy: string | ObjectId | Pick<IUser, '_id' | 'displayName'>
}

export interface IStudentDocument extends Omit<SoftDeleteDocument, '_id'>, IStudent {}
export type TStudentModel = Model<IStudentDocument>
export type TSoftDeleteStudentModel = SoftDeleteModel<IStudentDocument, TStudentModel>
export type TPaginatedStudentModel = PaginateModel<IStudentDocument>
