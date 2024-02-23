import { ObjectId } from 'mongoose'
import { IStudent } from './student.type'

export enum AttendanceSessionEnum {
	MORNING = 'Sáng',
	AFTERNOON = 'Chiều'
}

export interface IAttendance extends Document {
	_id: ObjectId
	student: ObjectId | string | Pick<IStudent, '_id' | 'fullName' | 'class'>
	date: Date
	session: AttendanceSessionEnum
	isPresent: boolean
	reason: string
}

export type TAttendancePayload = Array<
	Pick<IAttendance, 'isPresent' | 'reason'> & { student: Pick<IStudent, '_id' | 'fullName'> }
>
