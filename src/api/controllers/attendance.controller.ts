import { Request, Response } from 'express'
import createHttpError from 'http-errors'
import moment from 'moment'
import useCatchAsync from '../../helpers/useCatchAsync'
import * as AttendanceService from '../services/attendance.service'
import { HttpStatusCode } from './../../configs/statusCode.config'
import { AttendanceSessionEnum } from './../../types/attendance.type'

export const saveAttendanceByClass = useCatchAsync(async (req: Request, res: Response) => {
	const students = req.body
	const session = req.query._ss
	if (!session) throw createHttpError.BadRequest('"_ss" param must be provided !')

	if (
		!Object.keys(AttendanceSessionEnum)
			.map((ss) => ss.toLowerCase())
			.includes(session.toString())
	)
		throw createHttpError.BadRequest('"_ss" must be "morning" or "afternoon"')
	const result = await AttendanceService.saveAttendanceByClass(students, session.toString().toUpperCase())
	return res.status(HttpStatusCode.CREATED).json(result)
})

export const getStudentAttendance = useCatchAsync(async (req: Request, res: Response) => {
	const studentId: string = req.params.studentId
	const { _from: from, _to: to } = req.query as { [key: string]: string }
	let timeRangeSearchTerm

	if (from && to) {
		if (!moment(from).isValid() || !moment(to).isValid()) {
			throw createHttpError.BadRequest('Invalid time range search term')
		}
		if (!moment(to).isAfter(moment(from))) {
			throw createHttpError.BadRequest('End of time range must be greater than start of the one !')
		}
		timeRangeSearchTerm = {
			from: moment(from).format('YYYY-MM-DD'),
			to: moment(to).format('YYYY-MM-DD')
		}
	}
	const studentAttendance = await AttendanceService.getStudentAttendance(studentId, timeRangeSearchTerm)
	return res.status(HttpStatusCode.OK).json(studentAttendance)
})

export const getClassAttendanceBySession = useCatchAsync(async (req: Request, res: Response) => {
	const session = req.query._ss
	const date = req.query._dt ? req.query._dt.toString() : undefined
	const classId = req.query._class ? req.query._class.toString() : null
	if (!session) throw createHttpError.BadRequest('Session is required for searching!')
	if (!Object.keys(AttendanceSessionEnum).includes(session.toString().toUpperCase()))
		throw createHttpError.BadRequest('Invalid session filter value! Valid values are "morning", "afternoon"')
	const headTeacherId = req.profile._id as string
	const result = await AttendanceService.getClassAttendanceBySession(
		headTeacherId,
		date,
		session.toString().toUpperCase(),
		classId
	)
	return res.status(HttpStatusCode.OK).json(result)
})
