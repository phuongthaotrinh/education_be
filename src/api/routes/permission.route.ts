import express from 'express'
import * as permissionController from '../controllers/permission.controllers'
import { checkIsHeadmaster, checkAuthenticated } from '../middlewares/authGuard.middleware'
const router = express.Router()

router.get('/permissions/get-by-role', checkAuthenticated, permissionController.getPermissionByRole)
router.post('/permissions', checkAuthenticated, checkIsHeadmaster, permissionController.createPermission)
router.patch('/permissions/:id', checkAuthenticated, checkIsHeadmaster, permissionController.updatePermission)
router.patch(
	'/permissions/:id/restore',
	checkAuthenticated,
	checkIsHeadmaster,
	permissionController.restoreDeletedPermission
)
router.delete('/permissions/:id', checkAuthenticated, checkIsHeadmaster, permissionController.deletePermission)

export default router
