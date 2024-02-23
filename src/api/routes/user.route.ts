import express from 'express'
import * as UserController from '../controllers/user.controller'
import { checkAuthenticated, checkIsHeadmaster, checkIsTeacher } from '../middlewares/authGuard.middleware'
const router = express.Router()

router.post(
	'/users/create-teacher-account', // updated route name
	checkAuthenticated,
	checkIsHeadmaster,
	UserController.createTeacherAccount
)
router.post(
	'/users/create-parents-account', //updated route name
	checkAuthenticated,
	checkIsTeacher,
	UserController.createParentsAccount
)
router.patch(
	'/users/teachers/:userId/deactivate', // updated route name
	checkAuthenticated,
	checkIsHeadmaster,
	UserController.deactivateTeacherAccount
)
router.patch('/update-user', checkAuthenticated, UserController.updateUserInfo) // Users update themselve information
router.patch(
	'/users/:teacherId/update-teacher',
	checkAuthenticated,
	checkIsHeadmaster,
	UserController.updateTeacherInfo
)
router.patch('/users/parents/:parentsId', checkAuthenticated, checkIsTeacher, UserController.updateParentsInfo)
router.get(
	'/users/by-head-teacher-class',
	checkAuthenticated,
	checkIsTeacher,
	UserController.getParentsByHeadTeacherClass
)
router.get('/users/teachers', checkAuthenticated, UserController.getTeachersByStatus)
router.get('/users/:userId', checkAuthenticated, UserController.getUserDetails)
router.get('/users/parents/:classId', checkAuthenticated, UserController.getParentsUserByClass)
router.post('/users/search-parents', checkAuthenticated, checkIsTeacher, UserController.searchParentsUsers)

export default router
