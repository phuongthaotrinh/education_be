import { Request, Response } from 'express'
import { HttpStatusCode } from '../../configs/statusCode.config'
import useCatchAsync from '../../helpers/useCatchAsync'
import * as SchoolYearServices from '../services/schoolYear.service'

// [GET] /api/schoolYears?limit=10&page=1
export const schoolYearList = useCatchAsync(async (req: Request, res: Response) => {
	const limit: number = req.query._limit ? Number(req.query._limit) : 10
	const page: number = req.query._page ? Number(req.query._page) : 1
	const result = await SchoolYearServices.getAllSchoolYear(limit, page)
	return res.status(HttpStatusCode.OK).json(result)
})

// [GET] /api/schoolYears/current
export const getCurrentYear = useCatchAsync(async (req: Request, res: Response) => {
	const result = await SchoolYearServices.getCurrentSchoolYear()
	return res.status(200).json(result)
})

// [POST] /api/schoolYear
export const createSchoolYear = useCatchAsync(async (req: Request, res: Response) => {
	const result = await SchoolYearServices.createSchoolYear(req.body)
	return res.status(HttpStatusCode.CREATED).json(result)
})

export const updateSchoolYear = useCatchAsync(async (req: Request, res: Response) => {
	const updatedSchoolYear = await SchoolYearServices.updateSchoolYear(req.params.id, req.body)
	return res.status(HttpStatusCode.CREATED).json(updatedSchoolYear)
})
