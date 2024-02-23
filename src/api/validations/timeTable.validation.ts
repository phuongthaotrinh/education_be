import Joi from 'joi'
import { DayInWeekEnum, ITimeTable } from '../../types/timeTable.type'

export const validateTimeTableData = (payload: Array<Partial<ITimeTable>>) => {
	const schema = Joi.object({
		_id: Joi.string().optional(),
		class: Joi.string().required(),
		period: Joi.number().integer().valid(1, 2, 3, 4, 5, 6, 7, 8).required(),
		subject: Joi.string().required(),
		teacher: Joi.string().required(),
		dayOfWeek: Joi.string()
			.valid(...Object.values(DayInWeekEnum))
			.required(),
		createdAt: Joi.string().optional(),
		updatedAt: Joi.string().optional()
	})
	const arraySchema = Joi.array().items(schema).required()
	return arraySchema.validate(payload)
}

// .custom((value, helpers) => {
// 	const subjects = new Set()
// 	const teachers = new Set()

// 	for (const item of value) {
// 		if (subjects.has(item.subject) && teachers.has(item.teacher)) {
// 			return helpers.error('any.invalid', {
// 				message: 'Không thể phân công 1 môn học cho nhiều hơn 2 giáo viên trong 1 thời khóa biểu'
// 			})
// 		}

// 		subjects.add(item.subject)
// 		teachers.add(item.teacher)
// 	}

// 	return value
// })
