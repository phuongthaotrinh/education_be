import { Request, Response } from 'express'
import createHttpError from 'http-errors'
import * as SubjectServices from '../services/subject.service'
import { HttpStatusCode } from '../../configs/statusCode.config'
import useCatchAsync from '../../helpers/useCatchAsync'
import { isValidObjectId } from 'mongoose'

// [GET] /api/subjects
export const getAllSubjects = useCatchAsync(async (req: Request, res: Response) => {
	const subjects = await SubjectServices.getAllSubjects()
	if (!subjects) throw createHttpError.NotFound('Cannot get subjects!')
	return res.status(HttpStatusCode.OK).json(subjects)
})

export const getOneSubject = useCatchAsync(async (req: Request, res: Response) => {
	const subject = await SubjectServices.getOneSubject(req.params.id)
	return res.status(HttpStatusCode.OK).json(subject)
})

// [POST] /api/subjects
export const createSubject = useCatchAsync(async (req: Request, res: Response) => {
	const newSubject = await SubjectServices.createNewSubject(req.body)
	if (!newSubject) throw createHttpError.BadRequest('Cannot create new subject!')
	return res.status(HttpStatusCode.CREATED).json(newSubject)
})

// [PUT] /api/subject/:id
export const updateSubject = useCatchAsync(async (req: Request, res: Response) => {
	const id = req.params.id
	const newSubject = await SubjectServices.updateSubject(id, req.body)
	return res.status(HttpStatusCode.CREATED).json(newSubject)
})

// [DELETE] /api/subject/:id
export const deleteSubject = useCatchAsync(async (req: Request, res: Response) => {
	const id = req.params.id
	if (!id) throw createHttpError(HttpStatusCode.NO_CONTENT)
	const result = await SubjectServices.deleteSubject(id)
	return res.status(HttpStatusCode.NO_CONTENT).json(result)
})

export const getSubjectAppliedForClass = useCatchAsync(async (req: Request, res: Response) => {
	const grade = req.params.grade
	const VALID_GRADES = [1, 2, 3, 4, 5]
	if (!VALID_GRADES.includes(+grade)) throw createHttpError.BadRequest('Invalid grade value !')
	const subjects = await SubjectServices.getSubjectAppliedForClass(+grade)
	return res.status(HttpStatusCode.OK).json(subjects)
})

export const getSubjectsUserTeachingInClass = useCatchAsync(async (req: Request, res: Response) => {
	const teacherId = req.profile._id as string
	const classId = req.params.classId
	if (!isValidObjectId(classId)) throw createHttpError.BadRequest('Invalid class ID !')
	const subjects = await SubjectServices.getSubjectsUserTeachingInClass(classId, teacherId)
	return res.status(HttpStatusCode.OK).json(subjects)
})
