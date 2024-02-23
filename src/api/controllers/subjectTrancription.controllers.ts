import { Request, Response } from 'express'
import createHttpError from 'http-errors'
import mongoose, { ObjectId, isValidObjectId } from 'mongoose'
import { HttpStatusCode } from '../../configs/statusCode.config'
import useCatchAsync from '../../helpers/useCatchAsync'
import { getCurrentSchoolYear } from '../services/schoolYear.service'
import * as TranscriptService from '../services/subjectTrancription.service'

// [POST] /api/transcripts/:classId/:subjectId
export const insertSubjectTranscriptByClass = useCatchAsync(async (req: Request, res: Response) => {
	const data = req.body
	const subjectId = req.params.subjectId
	const classId = req.params.classId
	const result = await TranscriptService.insertSubjectTranscriptByClass(subjectId, classId, data)
	return res.status(HttpStatusCode.CREATED).json(result)
})

// [GET] /api/transcript/class/:classId/:subjectId
export const getTranscriptByClass = useCatchAsync(async (req: Request, res: Response) => {
	const subjectId = req.params.subjectId
	const classId = req.params.classId
	const result = await TranscriptService.getSubjectTranscriptByClass(classId, subjectId)
	return res.status(HttpStatusCode.OK).json(result)
})

// [GET] /api/transcript/student/:id?_scy=...
export const getTranscriptByStudent = useCatchAsync(async (req: Request, res: Response) => {
	const id = req.params.id
	const schoolYearQuery = req.query._scy as string
	const result = await TranscriptService.getStudentTranscript(id, schoolYearQuery)
	return res.status(HttpStatusCode.OK).json(result)
})

// [GET] /api/transcript/:classId?_scy=...
export const selectTranscriptAllSubjectByClass = useCatchAsync(async (req: Request, res: Response) => {
	const id = req.params.classId
	const currentSchoolYear = await getCurrentSchoolYear()
	const schoolYearQueryValue = req.query._scy
	const schoolYear =
		schoolYearQueryValue && isValidObjectId(schoolYearQueryValue)
			? new mongoose.Types.ObjectId(schoolYearQueryValue as string)
			: currentSchoolYear._id
	if (!isValidObjectId(schoolYear)) throw createHttpError.BadRequest('Invalid school year ID !')
	const result = await TranscriptService.getTranscriptsByClass(id, schoolYear as ObjectId)
	return res.status(HttpStatusCode.OK).json(result)
})

export const getValidSchoolYearOfStudentTranscript = useCatchAsync(async (req: Request, res: Response) => {
	const validSchoolYears = await TranscriptService.getValidSchoolYearOfStudentTranscript(req.params.studentId)
	return res.status(HttpStatusCode.OK).json(validSchoolYears)
})
