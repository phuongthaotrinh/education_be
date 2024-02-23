import express from 'express'
import { checkAuthenticated, checkIsHeadmaster, checkIsTeacher } from '../middlewares/authGuard.middleware'
import * as SubjectController from '../controllers/subject.controller'
const router = express.Router()

router.post('/subjects', checkAuthenticated, checkIsHeadmaster, SubjectController.createSubject)
router.patch('/subjects/:id', checkAuthenticated, checkIsHeadmaster, SubjectController.updateSubject)
router.delete('/subjects/:id', checkAuthenticated, checkIsHeadmaster, SubjectController.deleteSubject)
router.get('/subjects/:id', checkAuthenticated, checkIsTeacher, SubjectController.getOneSubject)
router.get('/subjects', checkAuthenticated, checkIsTeacher, SubjectController.getAllSubjects)
router.get('/subjects/by-grade/:grade', SubjectController.getSubjectAppliedForClass)
router.get(
	'/subjects/teaching-subjects/:classId',
	checkAuthenticated,
	checkIsTeacher,
	SubjectController.getSubjectsUserTeachingInClass
)

export default router
