import express, { Router } from 'express'
import UserRouter from './user.route'
import StudentRouter from './student.route'
import SchoolYearRouter from './schoolYear.route'
import AuthRouter from './auth.route'
import ClassRouter from './class.route'
import TimeTableRouter from './timetable.route'
import StudentConductRouter from './studentRemark.route'
import TrancriptRouter from './subjectTrancription.route'
import SubjectRouter from './subject.route'
import LearningMaterialRouter from './learningMaterial.route'
import PermissionRouter from './permission.route'
import AttendanceRouter from './attendance.route'
import StatisticsRouter from './statistics.route'
import ArticleRouter from './article.route'

const rootRouters: Array<Router> = [
	ClassRouter,
	UserRouter,
	AuthRouter,
	StudentRouter,
	SubjectRouter,
	SchoolYearRouter,
	PermissionRouter,
	LearningMaterialRouter,
	TrancriptRouter,
	TimeTableRouter,
	StudentConductRouter,
	AttendanceRouter,
	StatisticsRouter,
	ArticleRouter
]
const router = express.Router()

rootRouters.forEach((route) => {
	router.use(route)
})

export default router
