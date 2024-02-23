import { HttpError, isHttpError } from 'http-errors'
import { MongooseError } from 'mongoose'
import { HttpStatusCode } from '../configs/statusCode.config'
import { JsonWebTokenError } from 'jsonwebtoken'

interface ErrorResponse {
	message: string
	statusCode: number
}

export class HttpException implements ErrorResponse {
	message: string
	statusCode: number

	constructor(error: HttpError | MongooseError | Error) {
		this.message = error.message
		this.statusCode = isHttpError(error)
			? error.status
			: error instanceof JsonWebTokenError
			? HttpStatusCode.UNAUTHORIZED
			: HttpStatusCode.INTERNAL_SERVER_ERROR
	}
}
