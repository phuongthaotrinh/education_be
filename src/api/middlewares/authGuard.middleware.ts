import 'dotenv/config'
import { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import jwt, { JwtPayload } from 'jsonwebtoken'
import redisClient from '../../database/redis'
import useCatchAsync from '../../helpers/useCatchAsync'
import { AuthRedisKeyPrefix } from '../../types/redis.type'
import { UserRoleEnum } from '../../types/user.type'

export const checkAuthenticated = useCatchAsync(async (req: Request, _res: Response, next: NextFunction) => {
	if (!req.cookies.uid) throw createHttpError.Unauthorized('Invalid auth id!')
	const accessTokenKey = AuthRedisKeyPrefix.ACCESS_TOKEN + req.cookies.uid
	const storedAccessToken = await redisClient.get(accessTokenKey)
	if (!storedAccessToken) throw createHttpError.Unauthorized()
	const accessToken = req.cookies.access_token
	if (!accessToken) throw createHttpError.Unauthorized()
	const { payload } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload
	req.profile = payload
	req.role = payload.role
	next()
})

export const checkIsHeadmaster = useCatchAsync(async (req: Request, _res: Response, next: NextFunction) => {
	if (req.role !== UserRoleEnum.HEADMASTER) {
		throw createHttpError.Forbidden('Only headmaster allowed to access!')
	}
	next()
})

export const checkIsTeacher = useCatchAsync(async (req: Request, _res: Response, next: NextFunction) => {
	const teacherRoles = Object.values(UserRoleEnum).filter((role) => role !== UserRoleEnum.PARENTS)
	if (teacherRoles.indexOf(req.role) === -1) {
		throw createHttpError.Forbidden('Only teacher/headmaster allowed to access!')
	}
	next()
})
