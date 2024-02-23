import createHttpError from 'http-errors'
import { FilterQuery, PaginateOptions } from 'mongoose'
import { ILearningMaterial } from '../../types/learningMaterial.type'
import LearningMaterialModel from '../models/learningMaterial.model'
import { validateNewLearningMaterial } from '../validations/learningMaterial.validation'
import { deleteFile } from './googleDrive.service'

// Get files
export const getFiles = async (filterQuery: FilterQuery<ILearningMaterial>, query: PaginateOptions) => {
	return await LearningMaterialModel.paginate(filterQuery, query)
}

export const getOneFile = async (id: string) => await LearningMaterialModel.findOne({ _id: id })

export const getDeletedFilesByUser = async (userId: string, query: PaginateOptions) => {
	const deletedFiles = await LearningMaterialModel.paginate(
		{ uploadedBy: userId },
		{
			...query,
			customFind: 'findDeleted',
			useCustomCountFn() {
				return Promise.resolve(LearningMaterialModel.countDeleted({ uploadedBy: userId }))
			}
		}
	)
	return deletedFiles
}

export const getUploadedFilesByUser = async (userId: string, query: PaginateOptions) => {
	const files = await LearningMaterialModel.paginate({ uploadedBy: userId }, query)
	return files
}

// Save file to database
export const saveFile = async (payload: Omit<ILearningMaterial, '_id' | 'downloadUrl'>) => {
	const { error } = validateNewLearningMaterial(payload)
	if (error) throw createHttpError.BadRequest(error.message)
	return await new LearningMaterialModel(payload).save()
}

// Update file information
export const updateFile = async (fileId: string, payload: Partial<ILearningMaterial>) => {
	return await LearningMaterialModel.findOneAndUpdate({ fileId }, payload, {
		new: true
	})
}

// Temporarily delete file
export const softDeleteFile = async (fileId: string) => await LearningMaterialModel.delete({ fileId })

// Hard delete in both google drive store and database
export const hardDeleteFile = async (fileId: string) => {
	return await Promise.all([LearningMaterialModel.findOneAndDelete({ fileId }), deleteFile(fileId)])
}

// Restore deleted file
export const restoreDeletedFile = async (fileId: string) => await LearningMaterialModel.restore({ fileId })
