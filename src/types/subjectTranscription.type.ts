import { ObjectId } from 'mongoose'
import { SoftDeleteDocument } from 'mongoose-delete'
import { IStudent } from './student.type'
import { ISubject } from './subject.type'

export interface ISubjectTranscript extends Document {
	_id: ObjectId
	student: ObjectId & Partial<IStudent>
	schoolYear: ObjectId
	subject: ObjectId | string | Partial<ISubject>
	isPassed?: boolean
	firstSemester?: {
		midtermTest?: number
		finalTest?: number
		isPassed?: boolean
	}
	secondSemester?: {
		midtermTest?: number
		finalTest?: number
		isPassed?: boolean
	}
}

export type TTranscriptSchemaContext = {
	isMainSubject: boolean
	isSeniorGrade: boolean
}

export interface ISubjectTranscriptDocument extends Omit<SoftDeleteDocument, '_id'>, ISubjectTranscript {}
