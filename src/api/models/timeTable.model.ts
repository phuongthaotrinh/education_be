import mongoose from 'mongoose'
import mongooseAutoPopulate from 'mongoose-autopopulate'

import { DayInWeekEnum } from '../../types/timeTable.type'

const TimeTableSchema = new mongoose.Schema(
	{
		class: {
			type: mongoose.Types.ObjectId,
			ref: 'Classes',
			required: true
		},
		subject: {
			type: mongoose.Types.ObjectId,
			ref: 'Subjects',
			required: true
		},
		dayOfWeek: {
			type: String,
			required: true,
			enum: Object.values(DayInWeekEnum)
		},
		period: {
			type: Number,
			enum: [1, 2, 3, 4, 5, 6, 7, 8]
		},
		teacher: {
			type: mongoose.Types.ObjectId,
			required: true,
			ref: 'Users'
		}
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'time_tables',
		strictPopulate: false
	}
)

TimeTableSchema.plugin(mongooseAutoPopulate)

const TimeTableModel = mongoose.model('TimeTables', TimeTableSchema)

export default TimeTableModel
