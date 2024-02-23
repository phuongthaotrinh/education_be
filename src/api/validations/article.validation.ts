import Joi from 'joi'
import { IArticle } from '../../types/article.type'

export const validateArticleData = (data: Omit<IArticle, '_id'>) => {
	const schema = Joi.object({
		title: Joi.string().required(),
		content: Joi.string().required(),
		synopsis: Joi.string().optional(),
		userPosts: Joi.string().required(),
		userPicture: Joi.string().required()
	})
	return schema.validate(data)
}

export const validateArticleEdit = (data: Partial<Omit<IArticle, '_id'>>) => {
	const schema = Joi.object({
		title: Joi.string().required(),
		content: Joi.string().required(),
		synopsis: Joi.string().optional(),
		userPosts: Joi.string().required(),
		userPicture: Joi.string().required()
	})
	return schema.validate(data)
}
