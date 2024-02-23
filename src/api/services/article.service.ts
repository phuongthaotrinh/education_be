import createHttpError from 'http-errors'
import { IArticle, TArticleSortOption } from '../../types/article.type'
import ArticleModel from '../models/article.model'
import { validateArticleData, validateArticleEdit } from '../validations/article.validation'

export const getArticle = async (articleID: string) => await ArticleModel.findOne({ _id: articleID })

export const getAllArticle = async (sortOption: TArticleSortOption) => await ArticleModel.find().sort(sortOption)

export const createArticle = async (payload: Omit<IArticle, '_id'>) => {
	const { error, value } = validateArticleData(payload)
	if (error) throw createHttpError.BadRequest(error.message)
	const result: IArticle = await new ArticleModel(value).save()

	return { notification: result }
}

export const searchArticle = async (searchTerm: string) => {
	return await ArticleModel.find({ title: { $regex: searchTerm, $options: 'i' } }).lean()
}

export const updateArticle = async (payload: Partial<Omit<IArticle, '_id'>>, articleID: string) => {
	const existedArticle = await ArticleModel.findById(articleID)

	if (!existedArticle) throw createHttpError.NotFound('Article does not exist')

	const { error, value } = validateArticleEdit(payload)
	if (error) throw createHttpError.BadRequest(error.message)

	return await ArticleModel.findOneAndUpdate({ _id: articleID }, value, { new: true })
}

export const deleteArticle = async (articleID: string) => {
	const existedArticle = await ArticleModel.findById(articleID)

	if (!existedArticle) throw createHttpError.NotFound('Cannot find article to delete')
	await ArticleModel.deleteOne({ _id: articleID })

	return {
		message: 'Article has been permanently deleted',
		statusCode: 200
	}
}
