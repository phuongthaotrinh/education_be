import { Request, Response } from 'express'
import useCatchAsync from '../../helpers/useCatchAsync'
import * as StatisticsService from '../services/statistics.service'
import { HttpStatusCode } from '../../configs/statusCode.config'

export const getStdPercentageByGrade = useCatchAsync(async (req: Request, res: Response) => {
	const result = await StatisticsService.getStdPercentageByGrade()
	return res.status(HttpStatusCode.OK).json(result)
})

export const getGoodStudentByClass = useCatchAsync(async (req: Request, res: Response) => {
	const result = await StatisticsService.getGoodStudentByClass(req.params.classId)
	return res.status(HttpStatusCode.OK).json(result)
})

export const getPolicyBeneficiary = useCatchAsync(async (req: Request, res: Response) => {
	const result = await StatisticsService.getPolicyBeneficiary()
	return res.status(HttpStatusCode.OK).json(result)
})

export const getStdAllClass = useCatchAsync(async (req: Request, res: Response) => {
	const schoolYear = req.query.schoolYear
	const result = await StatisticsService.getStdAllClass((schoolYear as string) || undefined)
	return res.status(HttpStatusCode.OK).json(result)
})
