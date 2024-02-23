import { SortValues } from 'mongoose'
import { checkIsValidSortObject } from '../api/validations/sortQuery.validation'

export type Queries = {
	[key: string]: string
}

export const paramsStringify = (paramsObj: Queries) => {
	if (!paramsObj) return ''
	return (
		'?' +
		Object.keys(paramsObj)
			.map((key) => key + '=' + encodeURIComponent(paramsObj[key]))
			.join('&')
	)
}

export const multiFieldSortObjectParser = (query: Queries) => {
	try {
		if (!query) return
		const { error } = checkIsValidSortObject(query)
		if (error) return
		const sortFields = query._sort.split(',') // Giả sử giá trị của query string là 'field1,field2'
		const orders = query._order.split(',') // Giả sử giá trị của query string là 'field1,field2'

		return sortFields.reduce((sort: Queries, field: string, index: number) => {
			sort[field] = orders[index] // Sắp xếp tăng dần trên các trường
			return sort
		}, {})
	} catch (error) {
		throw error as Error
	}
}
