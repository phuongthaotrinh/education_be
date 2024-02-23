import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { ISchoolYear, TPaginatedSchoolYearModel } from '../../types/schoolYear.type'
import { toUpperCase } from '../../helpers/toolkit'

const SchoolYearSchema = new mongoose.Schema<ISchoolYear>(
	{
		name: {
			type: String,
			required: true,
			uppercase: true,
			trim: true
		},
		startAt: {
			type: Date
		},
		endAt: {
			type: Date
		}
	},
	{
		collection: 'school_years',
		timestamps: true,
		versionKey: false
	}
)

SchoolYearSchema.plugin(mongoosePaginate)
SchoolYearSchema.pre('save', function (next) {
	if (this.name && typeof this.name === 'string') this.name = toUpperCase(this.name)!
	next()
})

const SchoolYearModel: TPaginatedSchoolYearModel = mongoose.model<ISchoolYear, TPaginatedSchoolYearModel>(
	'SchoolYears',
	SchoolYearSchema
)

export default SchoolYearModel
