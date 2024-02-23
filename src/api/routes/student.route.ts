import express from 'express'
import {
	createStudent,
	updateStudent,
	getStudentsByClass,
	getStudentDetail,
	serviceStudent,
	getStudentLeftSchool,
	getPolicyBeneficiary,
	getStudentsByParents,
	getStudentsByHeadTeacherClass,
	getGraduatedStudentsBySchoolYear,
	getStudentsWaitingArrangeClass
} from '../controllers/student.controller'
import { checkAuthenticated, checkIsHeadmaster, checkIsTeacher } from '../middlewares/authGuard.middleware'

const router = express.Router()

router.get('/students/children-of-parents', checkAuthenticated, getStudentsByParents)
router.get('/students/policy-beneficiary', checkAuthenticated, checkIsHeadmaster, getPolicyBeneficiary)
// Lấy danh sách học sinh chờ xếp lớp
router.get(
	'/students/waiting-arrange-class/:classId',
	checkAuthenticated,
	checkIsHeadmaster,
	getStudentsWaitingArrangeClass
)
router.get('/students/left-school', checkAuthenticated, checkIsTeacher, getStudentLeftSchool)
router.get('/students/by-head-teacher-class', checkAuthenticated, checkIsTeacher, getStudentsByHeadTeacherClass)
router.get('/students/detail/:id', checkAuthenticated, getStudentDetail)
router.get('/students/:classId', checkAuthenticated, checkIsTeacher, getStudentsByClass)
router.post('/students', checkAuthenticated, checkIsHeadmaster, createStudent)
router.patch('/students/services/:id', checkAuthenticated, serviceStudent)
router.patch('/students/:id', checkAuthenticated, checkIsHeadmaster, updateStudent)
router.get('/sutdents/graduated/:schoolYearId', getGraduatedStudentsBySchoolYear)

//!DEPRECATED router.patch('/students/promote/:classId', promoteStudentsByClass)

export default router
