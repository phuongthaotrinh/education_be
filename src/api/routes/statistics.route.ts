import express from 'express'
import * as StatisticsController from '../controllers/statistics.controller'

const router = express.Router()

router.get('/statistics/student-by-grade', StatisticsController.getStdPercentageByGrade)
router.get('/statistics/student-by-class/:classId', StatisticsController.getGoodStudentByClass)
router.get('/statistics/student-policy', StatisticsController.getPolicyBeneficiary)
router.get('/statistics/student', StatisticsController.getStdAllClass)

export default router
