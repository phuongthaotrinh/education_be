import Joi from 'joi'
import { ISchoolYear } from '../../types/schoolYear.type'

export const validateNewSchoolYear = (data: Omit<ISchoolYear, '_id'>, latestSchoolYear?: ISchoolYear) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		startAt: latestSchoolYear ? Joi.date().greater(latestSchoolYear.endAt) : Joi.date().required(),
		endAt: Joi.date().greater(Joi.ref('startAt')).required()
	})

	return schema.validate(data)
}

export const validateUpdateSchoolYearData = (
	schoolYearId: string,
	data: Partial<ISchoolYear>,
	schoolYearList: Array<ISchoolYear>
) => {
	const schema = Joi.object({
		name: Joi.string().optional(),
		startAt: Joi.date().optional(),
		endAt: Joi.date().greater(Joi.ref('startAt')).optional()
	})
	const index = schoolYearList.findIndex((item) => item._id.toString() === schoolYearId)
	const previousSchoolYear = schoolYearList.at(index - 1)
	const nextSchoolYear = schoolYearList.at(index + 1)

	let schoolYearSchema = schema
	if (index === 0) {
		schoolYearSchema = schema.keys({
			endAt: Joi.date().greater(Joi.ref('startAt')).less(nextSchoolYear?.startAt!).optional()
		})
	} else if (index === schoolYearList.length - 1) {
		schoolYearSchema = schema.keys({
			startAt: Joi.date().greater(previousSchoolYear?.endAt!).optional(),
			endAt: Joi.date().greater(Joi.ref('startAt')).optional()
		})
	} else if (index === -1) {
		schoolYearSchema = schema
	} else {
		schoolYearSchema = schema.keys({
			startAt: Joi.date().greater(previousSchoolYear?.endAt!).optional(),
			endAt: Joi.date().greater(Joi.ref('startAt')).less(nextSchoolYear?.startAt!).optional()
		})
	}
	return schoolYearSchema.validate(data)
}
