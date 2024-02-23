/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-mixed-spaces-and-tabs */
import 'dotenv/config'
import { Request, Response } from 'express'
import createHttpError from 'http-errors'
import { PaginateOptions } from 'mongoose'
import { HttpStatusCode } from '../../configs/statusCode.config'
import { multiFieldSortObjectParser } from '../../helpers/queryParams'
import { getFileSize } from '../../helpers/toolkit'
import useCatchAsync from '../../helpers/useCatchAsync'
import { ILearningMaterial } from '../../types/learningMaterial.type'
import * as googleDriveService from '../services/googleDrive.service'
import * as LearningMaterialService from '../services/learningMaterial.service'
import { checkValidMimeType } from './../validations/file.validations'

export const getFiles = useCatchAsync(async (req: Request, res: Response) => {
	const sort = multiFieldSortObjectParser({
		_sort: req.query._sort as string,
		_order: req.query._order as string
	})

	const query: PaginateOptions = {
		limit: +req.query._limit! || 10,
		page: +req.query._page! || 1,
		sort: sort || {}
	}

	const allFiles = await LearningMaterialService.getFiles({ subject: req.params.subjectId, deleted: false }, query)
	return res.status(HttpStatusCode.OK).json(allFiles)
})

export const getFilesUserDeleted = useCatchAsync(async (req: Request, res: Response) => {
	const sort = multiFieldSortObjectParser({
		_sort: req.query._sort as string,
		_order: req.query._order as string
	})

	const query: PaginateOptions = {
		limit: +req.query._limit! || 10,
		page: +req.query._page! || 1,
		sort: sort || {}
	}
	const user = req.profile._id as string
	const deletedFiles = await LearningMaterialService.getDeletedFilesByUser(user, query)
	return res.status(HttpStatusCode.OK).json(deletedFiles)
})

export const uploadFile = useCatchAsync(async (req: Request, res: Response) => {
	const [file] = req.files as Express.Multer.File[]
	const user = req.profile
	if (!file) {
		throw createHttpError.BadRequest('File must be provided!')
	}
	if (!checkValidMimeType(file)) {
		throw createHttpError.UnprocessableEntity('File type is not allowed to upload!')
	}

	const uploadedFile = await googleDriveService.uploadFile(file, process.env.FOLDER_ID!)
	if (!uploadedFile) {
		throw createHttpError.UnprocessableEntity('Failed to upload file')
	}
	const newFile = {
		fileId: uploadedFile.data?.id as string,
		title: req.body.title,
		mimeType: file.mimetype,
		fileSize: file.size,
		subject: req.body.subject,
		uploadedBy: user._id
	} as Omit<ILearningMaterial, '_id' | 'downloadUrl'>

	const savedFile = await LearningMaterialService.saveFile(newFile)

	return res.status(HttpStatusCode.CREATED).json(savedFile)
})

export const getUserUploadedFiles = useCatchAsync(async (req: Request, res: Response) => {
	const sort = multiFieldSortObjectParser({
		_sort: req.query._sort as string,
		_order: req.query._order as string
	})

	const query: PaginateOptions = {
		limit: +req.query._limit! || 10,
		page: +req.query._page! || 1,
		sort: sort || {}
	}
	const user = req.profile._id as string
	const userUploadedFiles = await LearningMaterialService.getUploadedFilesByUser(user, query)
	return res.status(HttpStatusCode.OK).json(userUploadedFiles)
})

export const updateFile = useCatchAsync(async (req: Request, res: Response) => {
	const updatedFile = await LearningMaterialService.updateFile(req.params.fileId, req.body)
	return res.status(HttpStatusCode.CREATED).json(updatedFile)
})

export const deleteFile = useCatchAsync(async (req: Request, res: Response) => {
	if (!req.query._hard) {
		throw createHttpError.BadRequest('Missing delete option param "_hard"')
	}
	const isHardDeleteOption = req.query._hard && JSON.parse(req.query._hard.toString()) === true

	if (isHardDeleteOption) {
		const deletedFileInDb = await LearningMaterialService.hardDeleteFile(req.params.fileId)
		const deletedFile = await googleDriveService.deleteFile(req.params.fileId)
		return res.status(HttpStatusCode.NO_CONTENT).json({
			deletedFile,
			deletedFileInDb
		})
	} else {
		const tempDeletedFile = await LearningMaterialService.softDeleteFile(req.params.fileId)
		return res.status(HttpStatusCode.NO_CONTENT).json(tempDeletedFile)
	}
})

export const restoreFile = useCatchAsync(async (req: Request, res: Response) => {
	const restoredFile = await LearningMaterialService.restoreDeletedFile(req.params.fileId)
	return res.status(HttpStatusCode.OK).json(restoredFile)
})
