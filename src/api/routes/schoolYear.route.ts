import express from 'express'
import * as SchoolYearController from '../controllers/schoolYear.controller'
import { checkAuthenticated, checkIsHeadmaster } from '../middlewares/authGuard.middleware'

const router = express.Router()

router.get('/school-years/current', checkAuthenticated, SchoolYearController.getCurrentYear)

router.get('/school-years', checkAuthenticated, SchoolYearController.schoolYearList)
router.post('/school-years', checkAuthenticated, checkIsHeadmaster, SchoolYearController.createSchoolYear)
router.patch('/school-years/:id', checkAuthenticated, checkIsHeadmaster, SchoolYearController.updateSchoolYear)

export default router
