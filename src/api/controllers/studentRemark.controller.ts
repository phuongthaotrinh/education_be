/* eslint-disable prettier/prettier */
import { Request, Response } from 'express'
import useCatchAsync from '../../helpers/useCatchAsync'
import * as StudentConductService from '../services/studentRemark.service'
import { HttpStatusCode } from '../../configs/statusCode.config'

// [PUT] /api/student-remark/:classId
export const createStudentRemark = useCatchAsync(async (req: Request, res: Response) => {
	const newStudenConductRemark = await StudentConductService.createStudentRemarkEntireClass(
		req.body,
		<string>req.profile?._id
	)
	return res.status(HttpStatusCode.CREATED).json(newStudenConductRemark)
})

// [GET] /api/student-remark
export const getStudentsRemarkByHeadTeacher = useCatchAsync(async (req: Request, res: Response) => {
	const headTeacherID = <string>req.profile?._id
	const remarks = await StudentConductService.getStudentRemarkByClass(headTeacherID)
	return res.status(HttpStatusCode.OK).json(remarks)
})

//! FOR TESTING PURPOSE ONLY
// [GET] /api/student-remark/gen/
export const generateStudentRemark = useCatchAsync(async (req: Request, res: Response) => {
	const generatedRemarks = await StudentConductService.generateFakeStudentRemark(<string>req.profile?._id)
	return res.status(HttpStatusCode.CREATED).json(generatedRemarks)
})

export const getStudentRemark = useCatchAsync(async (req: Request, res: Response) => {
	const studentId = req.params.studentId
	const selectedSchoolYear = req.query._scy
	const remarkOfStudent = await StudentConductService.getStudentRemark(studentId, <string>selectedSchoolYear)
	return res.status(HttpStatusCode.OK).json(remarkOfStudent)
})
