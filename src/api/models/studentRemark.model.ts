import mongoose from 'mongoose'
import mongooseAutoPopulate from 'mongoose-autopopulate'
import { IStudentRemark } from '../../types/student.type'

const StudentRemarkSchema = new mongoose.Schema(
	{
		student: {
			type: mongoose.Types.ObjectId,
			ref: 'Students',
			required: true,
			autopopulate: { select: '_id fullName -parents' }
		},
		schoolYear: {
			type: mongoose.Types.ObjectId,
			ref: 'SchoolYears',
			autopopulate: true
		},
		conduct: {
			// đánh giá phẩm chất
			type: String,
			required: true
		},
		proficiency: {
			// đánh giá năng lực
			type: String,
			required: true
		},
		isQualified: {
			type: Boolean,
			trim: true,
			required: true
		},
		remarkedBy: {
			type: mongoose.Types.ObjectId,
			required: true,
			ref: 'Users',
			autopopulate: { select: '_id displayName', options: { lean: true } }
		}
	},
	{
		collection: 'student_remarks',
		versionKey: false,
		timestamps: true
	}
)

StudentRemarkSchema.plugin(mongooseAutoPopulate)
StudentRemarkSchema.index({ createdAt: 1 }, { expires: '30d' })

const StudentRemarkModel = mongoose.model<IStudentRemark>('StudentRemarks', StudentRemarkSchema)

export default StudentRemarkModel
