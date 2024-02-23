import mongoose from 'mongoose'
import { toCapitalize } from '../../helpers/toolkit'
import { ISubject, ISubjectDocument } from '../../types/subject.type'

const SubjectSchema = new mongoose.Schema<ISubjectDocument>(
	{
		subjectName: {
			type: String,
			required: true
		},
		subjectCode: {
			type: String,
			unique: true,
			uppercase: true,
			required: true
		},
		appliedForGrades: {
			type: [Number],
			required: true,
			default: [1, 2, 3, 4, 5]
		},
		isMainSubject: {
			type: Boolean,
			required: true
		},
		isElectiveSubject: {
			type: Boolean,
			required: true
		}
	},
	{
		versionKey: false,
		collection: 'subjects',
		timestamps: true
	}
)

SubjectSchema.pre('save', function (next) {
	this.subjectName = toCapitalize(this.subjectName)!
	if (this.isMainSubject === true) this.isElectiveSubject = false
	if (this.isElectiveSubject === true) this.isMainSubject = false
	next()
})

const SubjectModel = mongoose.model<ISubject>('Subjects', SubjectSchema)

export default SubjectModel
