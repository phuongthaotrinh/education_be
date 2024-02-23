import { Request, Response } from 'express'
import createHttpError from 'http-errors'
import { SortOrder, isValidObjectId } from 'mongoose'
import { HttpStatusCode } from '../../configs/statusCode.config'
import useCatchAsync from '../../helpers/useCatchAsync'
import { IArticle } from '../../types/article.type'
import * as ArticleService from '../services/article.service'

// [POST] /api/article (create article)
export const createArticle = useCatchAsync(async (req: Request, res: Response) => {
	const { displayName = null, picture = null } = req.profile
	const data = { ...req.body, userPosts: displayName, userPicture: picture }
	const notification = await ArticleService.createArticle(data)

	return res.status(HttpStatusCode.CREATED).json(notification)
})

// [PUT] /api/article/:id (edit article)
export const updateArticle = useCatchAsync(async (req: Request, res: Response) => {
	const { displayName = null, picture = null } = req.profile
	const _id: unknown = req.params.id
	const data: Partial<Omit<IArticle, '_id'>> = { ...req.body, userPosts: displayName, userPicture: picture }
	const updatedArticle = await ArticleService.updateArticle(data, _id as string)

	return res.status(HttpStatusCode.CREATED).json(updatedArticle)
})

// [DELETE] /api/article/:id (delete article)
export const deleteArticle = useCatchAsync(async (req: Request, res: Response) => {
	const id = req.params.id
	if (!id) throw createHttpError(HttpStatusCode.NO_CONTENT)
	const result = await ArticleService.deleteArticle(id)
	return res.status(result.statusCode).json(result)
})

// [GET] /api/article?_sort=createdDate
export const getAllArticle = useCatchAsync(async (req: Request, res: Response) => {
	const fieldToSort = req.query._sort?.toString() || 'createdAt'
	const order: SortOrder = req.query._order === 'asc' ? 1 : -1
	const sortableFields = ['createdAt', 'updatedAt']

	if (!sortableFields.includes(fieldToSort as string)) {
		throw createHttpError.BadRequest(`_sort can only belong to [${sortableFields}]`)
	}
	const notification = await ArticleService.getAllArticle({ [fieldToSort]: order })

	return res.status(HttpStatusCode.OK).json(notification)
})

// [GET] /api/article/:id
export const getArticle = useCatchAsync(async (req: Request, res: Response) => {
	const id = req.params.id
	if (!id || !isValidObjectId(id)) throw createHttpError.BadRequest('Missing parameter')

	const result = await ArticleService.getArticle(id)
	if (!result) throw createHttpError.NotFound('Article not found')

	return res.status(HttpStatusCode.OK).json(result)
})

// [GET] /article/search
export const searchArticle = useCatchAsync(async (req: Request, res: Response) => {
	const result = await ArticleService.searchArticle(req.body.searchTerm)
	if (!result || !result.length) throw createHttpError.NotFound('Cannot find any article!')

	return res.status(HttpStatusCode.OK).json(result)
})
