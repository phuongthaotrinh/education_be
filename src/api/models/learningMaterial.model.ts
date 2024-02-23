import mongoose from 'mongoose'
import mongooseAutoPopulate from 'mongoose-autopopulate'
import mongooseDelete from 'mongoose-delete'
import mongoosePaginate from 'mongoose-paginate-v2'
import { toCapitalize } from '../../helpers/toolkit'
import { ILearningMaterialDocument, TPaginateModel, TSoftDeleteModel } from '../../types/learningMaterial.type'

const LearningMaterialSchema = new mongoose.Schema<ILearningMaterialDocument>(
	{
		subject: {
			type: mongoose.Types.ObjectId,
			ref: 'Subjects',
			required: true,
			autopopulate: true
		},

		fileId: {
			type: String,
			required: true,
			trim: true
		},
		title: {
			type: String,
			required: true,
			trim: true
		},
		fileSize: {
			type: Number,
			required: true,
			trim: true,
			lowercase: true
		},
		mimeType: {
			type: String,
			required: true
		},
		downloadUrl: {
			type: String,
			default: ''
		},
		uploadedBy: {
			type: mongoose.Types.ObjectId,
			ref: 'Users',
			autopopulate: { select: '_id displayName', options: { lean: true } },
			required: true
		}
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'learning_materials'
	}
)

// Plugins
LearningMaterialSchema.plugin(mongooseAutoPopulate)
LearningMaterialSchema.plugin(mongoosePaginate)
LearningMaterialSchema.plugin(mongooseDelete, {
	overrideMethods: true,
	deletedAt: true
})

// Middleware
LearningMaterialSchema.pre('save', function (next) {
	this.downloadUrl = 'https://drive.google.com/uc?export=download&id=' + this.fileId
	this.title = toCapitalize(this.title)
	next()
})

const LearningMaterialModel = mongoose.model<ILearningMaterialDocument, TSoftDeleteModel & TPaginateModel>(
	'learning_materials',
	LearningMaterialSchema
)

export default LearningMaterialModel
