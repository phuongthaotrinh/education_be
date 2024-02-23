/* eslint-disable no-useless-catch */
import createHttpError from 'http-errors'
import { toUpperCase } from '../../helpers/toolkit'
import { ISchoolYear } from '../../types/schoolYear.type'
import SchoolYearModel from '../models/schoolYear.model'
import { validateNewSchoolYear, validateUpdateSchoolYearData } from '../validations/schoolYear.validation'

// lấy ra toàn bộ các năm học
export const getAllSchoolYear = async (limit: number, page: number) => {
	const [currentSchoolyear, schoolYearList] = await Promise.all([
		getCurrentSchoolYear(),
		SchoolYearModel.paginate(
			{},
			{
				limit: limit,
				page: page,
				sort: { startAt: 'asc' }
			}
		)
	])
	return { unableToCreateSchoolYear: !!currentSchoolyear, ...schoolYearList }
}
// tạo mới 1 năm học
export const createSchoolYear = async (payload: Omit<ISchoolYear, '_id'>) => {
	const allSchoolYears = await SchoolYearModel.find().sort({ endAt: -1 })
	const latestSchoolYear = allSchoolYears.at(0)
	if (allSchoolYears.some((schoolYear) => toUpperCase(payload.name) === schoolYear.name))
		throw createHttpError.Conflict(`School year's name already existed!`)
	if (latestSchoolYear && new Date(latestSchoolYear?.endAt).getTime() > new Date().getTime())
		throw createHttpError.BadRequest('Current school year has not finished, please comeback later!')
	const { error, value } = validateNewSchoolYear(payload, latestSchoolYear as ISchoolYear)
	if (error) throw createHttpError.BadRequest(error.message)
	return await new SchoolYearModel(value).save()
}

// lấy ra schoolYear hiện tại
export const getCurrentSchoolYear = async () => {
	const schoolYear = await SchoolYearModel.findOne({
		$and: [{ startAt: { $lte: new Date() } }, { endAt: { $gte: new Date() } }]
	})
	if (!schoolYear) throw createHttpError.NotFound('The new school year has not started yet, please come back later')
	return schoolYear
}

export const updateSchoolYear = async (schoolYearId: string, payload: Partial<ISchoolYear>) => {
	const allSchoolYears = await SchoolYearModel.find().sort({ startAt: 1, endAt: 1 })
	const { error, value } = validateUpdateSchoolYearData(schoolYearId, payload, allSchoolYears)
	if (error) throw createHttpError.BadRequest(error.message)
	const existedSchoolYear = await SchoolYearModel.exists({
		_id: { $ne: schoolYearId },
		name: toUpperCase(payload.name!)
	})
	if (existedSchoolYear) throw createHttpError.Conflict('School year name already existed!')
	return await SchoolYearModel.findOneAndUpdate({ _id: schoolYearId }, value, { new: true, upsert: false })
}

export const getLatestSchoolYear = async () => {
	const schoolYears = await SchoolYearModel.find().sort({ endAt: -1 })
	return schoolYears[0]
}
