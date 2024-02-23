import { ObjectId, SortOrder } from 'mongoose'
export interface IArticle extends Document {
	_id: ObjectId
	title: string
	content: string
	synopsis: string
	userPosts: string
	userPicture: string
}

export type TArticleSortOption = {
	createdAt?: SortOrder
	updatedAt?: SortOrder
}
