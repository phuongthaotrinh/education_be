import { Model, ObjectId } from 'mongoose'
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface ISubject extends Document {
	_id: ObjectId
	subjectName: string
	subjectCode: string
	appliedForGrades: Array<number>
	isMainSubject: boolean
	isElectiveSubject: boolean
}
export interface ISubjectDocument extends Omit<SoftDeleteDocument, '_id'>, ISubject {}
export type TSubjectModel = Model<ISubjectDocument>
export type TSoftDeleteSubjectModel = SoftDeleteModel<ISubjectDocument, TSubjectModel>
