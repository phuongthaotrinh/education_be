import express from 'express'
import * as ClassController from '../controllers/class.controller'
import { checkAuthenticated, checkIsHeadmaster, checkIsTeacher } from '../middlewares/authGuard.middleware'
const router = express.Router()

router.get('/classes/teaching-classes', checkAuthenticated, checkIsTeacher, ClassController.getTeachingClasses)
router.patch('/classes/arrange-class', ClassController.arrangeClass)
router.get('/classes/:id', ClassController.getOneClass)
router.post('/classes', checkAuthenticated, checkIsHeadmaster, ClassController.createClass)
router.patch('/classes/:id', checkAuthenticated, checkIsHeadmaster, ClassController.updateClass)
router.delete('/classes/:id', checkAuthenticated, checkIsHeadmaster, ClassController.removeClass)
router.get('/classes', ClassController.getClasses)

export default router
