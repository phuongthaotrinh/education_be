import Joi from 'joi'
import { ILearningMaterial } from '../../types/learningMaterial.type'

export const validateNewLearningMaterial = (payload: Omit<ILearningMaterial, '_id' | 'downloadUrl'>) => {
	const schema = Joi.object({
		title: Joi.string().required(),
		fileId: Joi.string().required(),
		fileSize: Joi.number().min(1).required(),
		subject: Joi.string().required(),
		uploadedBy: Joi.string().required(),
		mimeType: Joi.string().required()
	})

	return schema.validate(payload)
}
