import mongoose from 'mongoose'
import { AttendanceSessionEnum, IAttendance } from '../../types/attendance.type'

const AttendanceSchema = new mongoose.Schema(
	{
		student: {
			type: mongoose.Types.ObjectId,
			required: true,
			ref: 'Students',
			autopopulate: { select: '_id fullName', options: { lean: true } }
		},
		date: {
			type: String,
			required: true,
			trim: true
		},
		isPresent: {
			type: Boolean,
			required: true
		},
		session: {
			type: String,
			required: true,
			enum: Object.values(AttendanceSessionEnum)
		},
		reason: {
			type: String,
			trim: true
		}
	},
	{
		timestamps: true,
		versionKey: false,
		expires: '30d' // auto delete after 37 weeks
	}
)

AttendanceSchema.pre('save', function () {
	if (this.isPresent === false && !this.reason) this.reason = 'Không có lý do'
})

const AttendanceModel = mongoose.model<IAttendance>('Attendance', AttendanceSchema)

export default AttendanceModel
