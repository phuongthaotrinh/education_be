import express from 'express'
import * as StudentRemarkController from '../controllers/studentRemark.controller'
import { checkAuthenticated, checkIsTeacher } from '../middlewares/authGuard.middleware'

const router = express.Router()

router.put('/student-remark', checkAuthenticated, checkIsTeacher, StudentRemarkController.createStudentRemark)
router.get('/student-remark/:studentId', checkAuthenticated, StudentRemarkController.getStudentRemark)
router.get(
	'/student-remark',
	checkAuthenticated,
	checkIsTeacher,
	StudentRemarkController.getStudentsRemarkByHeadTeacher
)
//! FOR TESTING PURPOSE ONLY
router.get('/student-remark/gen', checkAuthenticated, checkIsTeacher, StudentRemarkController.generateStudentRemark)

export default router
