import mongoose from 'mongoose'
import mongooseAutoPopulate from 'mongoose-autopopulate'
import mongooseDelete from 'mongoose-delete'
import { IClassDocument, TSoftDeleteClassModel } from '../../types/class.type'

const ClassSchema = new mongoose.Schema<IClassDocument>(
	{
		className: {
			type: String,
			required: true,
			trim: true,
			uppercase: true,
			unique: true
		},
		grade: {
			type: Number,
			enum: [1, 2, 3, 4, 5],
			required: true
		},
		headTeacher: {
			type: mongoose.Types.ObjectId,
			ref: 'Users',
			autopopulate: { select: '_id displayName phone email', options: { lean: true } }
		},
		isTemporary: {
			type: Boolean,
			default: false
		}
	},
	{
		collection: 'classes',
		timestamps: true,
		toJSON: { virtuals: true }
	}
)
ClassSchema.plugin(mongooseAutoPopulate)
ClassSchema.plugin(mongooseDelete, {
	overrideMethods: ['find', 'findOne'],
	deletedAt: true
})

ClassSchema.virtual('totalStudents', {
	localField: '_id',
	foreignField: 'class',
	ref: 'Students',
	count: true,
	justOne: false,
	options: { lean: true }
})

const ClassModel: TSoftDeleteClassModel = mongoose.model<IClassDocument, TSoftDeleteClassModel>('Classes', ClassSchema)

export default ClassModel
