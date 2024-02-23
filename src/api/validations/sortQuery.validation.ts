import Joi from 'joi'
import { Queries } from '../../helpers/queryParams'

export const checkIsValidSortObject = (sortObject: Queries) => {
	return Joi.object({
		_sort: Joi.string().required(),
		_order: Joi.string().required()
	}).validate(sortObject)
}
