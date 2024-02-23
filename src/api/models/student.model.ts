import mongoose from 'mongoose'
import mongooseAutoPopulate from 'mongoose-autopopulate'
import mongoosePaginate from 'mongoose-paginate-v2'
import { toCapitalize } from '../../helpers/toolkit'
import { IStudentDocument, StudentStatusEnum, TPaginatedStudentModel } from '../../types/student.type'
import { UserGenderEnum } from '../../types/user.type'
import { ObjectId } from 'mongodb'

const StudentSchema = new mongoose.Schema<IStudentDocument>(
	{
		code: {
			type: String,
			uppercase: true,
			unique: true
		},
		class: {
			type: mongoose.Types.ObjectId,
			ref: 'Classes',
			autopopulate: true
		},
		fullName: {
			type: String,
			required: true,
			trim: true,
			minLength: 6
		},
		parents: {
			type: mongoose.Types.ObjectId,
			ref: 'Users',
			autopopulate: { select: '_id displayName phone email', options: { lean: true } }
		},
		gender: {
			type: String,
			required: true,
			enum: Object.values(UserGenderEnum)
		},
		dateOfBirth: {
			type: Date,
			required: true
		},
		isPolicyBeneficiary: {
			type: Boolean,
			default: false
		},
		status: {
			type: String,
			enum: Object.values(StudentStatusEnum),
			default: StudentStatusEnum.STUDYING
		},
		transferSchoolDate: {
			type: Date,
			default: null
		},
		graduatedAt: {
			type: ObjectId,
			ref: 'SchoolYears',
			autopopulate: { select: '_id name' }
		},
		dropoutDate: {
			type: Date,
			default: null
		}
	},
	{
		versionKey: false,
		timestamps: true,
		collection: 'students',
		toJSON: { virtuals: true, transform: true },
		toObject: { virtuals: true, transform: true }
	}
)

StudentSchema.plugin(mongoosePaginate)
StudentSchema.plugin(mongooseAutoPopulate)

StudentSchema.virtual('remarkOfHeadTeacher', {
	localField: '_id',
	foreignField: 'student',
	ref: 'StudentRemarks',
	justOne: true
})

StudentSchema.pre('save', function (next) {
	this.fullName = toCapitalize(this.fullName) as string
	next()
})
const StudentModel: TPaginatedStudentModel = mongoose.model<IStudentDocument, TPaginatedStudentModel>(
	'Students',
	StudentSchema
)

export default StudentModel
