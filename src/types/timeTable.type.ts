import { Document, ObjectId } from 'mongoose'
import { ISubject, ISubjectDocument } from './subject.type'
import { IUser, IUserDocument } from './user.type'
import { IClass } from './class.type'
export interface IScheduleSlotTime extends Document {
	subject: ObjectId | ISubjectDocument | string
	teacher: ObjectId | IUserDocument | string
	period: number
}

export interface ITimeTable extends Document {
	class: ObjectId | string | Partial<IClass>
	subject: ObjectId | Partial<ISubject> | string
	teacher: ObjectId | Partial<IUser> | string
	period: number
	dayOfWeek: string | DayInWeekEnum
	createdAt: Date
	updatedAt: Date
}

export enum DayInWeekEnum {
	MONDAY = 'monday',
	TUESDAY = 'tuesday',
	WEDNESSDAY = 'wednesday',
	THURSDAY = 'thursday',
	FRIDAY = 'friday'
}
