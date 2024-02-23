import * as LearningMaterialController from '../controllers/learningMaterial.controller'
import express from 'express'
import multer from 'multer'
import { checkAuthenticated, checkIsTeacher } from '../middlewares/authGuard.middleware'
const upload = multer()
const router = express.Router()

router.get(
	'/learning-materials/get-by-subject/:subjectId',
	checkAuthenticated,
	checkIsTeacher,
	LearningMaterialController.getFiles
)
router.post(
	'/learning-materials/upload',
	checkAuthenticated,
	checkIsTeacher,
	upload.any(),
	LearningMaterialController.uploadFile
)
router.patch(
	'/learning-materials/:fileId/edit',
	checkAuthenticated,
	checkIsTeacher,
	LearningMaterialController.updateFile
)
router.patch(
	'/learning-materials/:fileId/restore',
	checkAuthenticated,
	checkIsTeacher,
	LearningMaterialController.restoreFile
)
router.delete(
	'/learning-materials/:fileId/delete',
	checkAuthenticated,
	checkIsTeacher,
	LearningMaterialController.deleteFile
)
router.get(
	'/learning-materials/user-uploaded',
	checkAuthenticated,
	checkIsTeacher,
	LearningMaterialController.getUserUploadedFiles
)
router.get(
	'/learning-materials/user-deleted',
	checkAuthenticated,
	checkIsTeacher,
	LearningMaterialController.getFilesUserDeleted
)

export default router
