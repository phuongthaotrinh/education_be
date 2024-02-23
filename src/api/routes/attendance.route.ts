import express from 'express'
import * as AttendanceController from '../controllers/attendance.controller'
import { checkAuthenticated, checkIsTeacher } from '../middlewares/authGuard.middleware'

const router = express.Router()

router.put('/attendances', checkAuthenticated, checkIsTeacher, AttendanceController.saveAttendanceByClass)
router.get(
	'/attendances/by-class',
	checkAuthenticated,
	checkIsTeacher,
	AttendanceController.getClassAttendanceBySession
)
router.get('/attendances/student/:studentId', checkAuthenticated, AttendanceController.getStudentAttendance)

export default router
