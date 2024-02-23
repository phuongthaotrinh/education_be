import 'dotenv/config'
import { Request, Response } from 'express'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { HttpStatusCode } from '../../configs/statusCode.config'
import { getVerificationEmailTemplate } from '../../helpers/mailTemplates'
import useCatchAsync from '../../helpers/useCatchAsync'
import { IUser, UserRoleEnum } from '../../types/user.type'
import { sendMail } from '../services/mail.service'
import * as UserService from '../services/user.service'
import {
	validateNewParentsData,
	validateNewTeacherData,
	validateUpdateUserData
} from './../validations/user.validation'

// [POST] /users/create-teacher-account
export const createTeacherAccount = useCatchAsync(async (req: Request, res: Response) => {
	const { error } = validateNewTeacherData(req.body)
	if (error) {
		throw createHttpError.BadRequest(error.message)
	}
	const newUser = (await UserService.createUser({ ...req.body, role: UserRoleEnum.TEACHER })) as IUser
	const token = jwt.sign({ auth: newUser.email }, <string>process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: '7d'
	})
	const domain = req.protocol + '://' + req.get('host')
	await sendMail(
		getVerificationEmailTemplate({
			redirectDomain: domain,
			user: { ...req.body, role: UserRoleEnum.TEACHER },
			token
		})
	)
	return res.status(HttpStatusCode.CREATED).json(newUser)
})

// [POST] /users/create-parents-account
export const createParentsAccount = useCatchAsync(async (req: Request, res: Response) => {
	const { error, value } = validateNewParentsData(req.body)
	if (error) throw createHttpError.BadRequest(error.message)
	const payload = Array.isArray(value)
		? value.map((user) => ({
				...user,
				role: UserRoleEnum.PARENTS
		  }))
		: {
				...value,
				role: UserRoleEnum.PARENTS
		  }

	// Create multiple or single parent user depending on type of payload and multi optional value
	const newParents = await UserService.createUser(payload)

	const domain = req.protocol + '://' + req.get('host')

	// send verification mail to multiple users
	if (Array.isArray(payload)) {
		const sendMailPromises = payload.map(
			(recipient: Partial<IUser>) =>
				new Promise((resolve) => {
					const token = jwt.sign({ auth: recipient?.email }, <string>process.env.ACCESS_TOKEN_SECRET, {
						expiresIn: '7d'
					})

					resolve(
						sendMail(
							getVerificationEmailTemplate({
								redirectDomain: domain,
								token: token,
								user: recipient as Pick<IUser, 'email' | 'displayName' | 'role'>
							})
						)
					)
				})
		)

		await Promise.all(sendMailPromises)
	}
	// Send mail for one user
	else {
		const token = jwt.sign({ auth: payload?.email }, <string>process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: '7d'
		})
		sendMail(
			getVerificationEmailTemplate({
				redirectDomain: domain,
				token: token,
				user: payload
			})
		)
	}

	return res.status(HttpStatusCode.CREATED).json(newParents)
})

// [PATCH] /users/:id/update-teacher
export const updateTeacherInfo = useCatchAsync(async (req: Request, res: Response) => {
	const teacherId: string = req.params.teacherId
	const { error, value } = validateUpdateUserData(req.body)
	if (error) throw createHttpError.BadRequest(error.message)
	const updatedTeacher = await UserService.updateTeacherInfo(teacherId, value)
	if (!updatedTeacher) throw createHttpError.NotFound('Cannot find teacher to update!')
	return res.status(HttpStatusCode.CREATED).json(updatedTeacher)
})

// [GET] /users/teachers?is_verified=true&employment_status=false
export const getTeachersByStatus = useCatchAsync(async (req: Request, res: Response) => {
	const status = req.query._status
	const teachers = await UserService.getTeacherUsersByStatus(status as string | undefined)
	if (!teachers) throw createHttpError.NotFound('Không thể tìm thấy giáo viên nào!')
	return res.status(HttpStatusCode.OK).json(teachers)
})

// [PATCH] /users/:userId
export const deactivateTeacherAccount = useCatchAsync(async (req: Request, res: Response) => {
	const deactivatedTeacher = await UserService.deactivateTeacherUser(req.params.userId)
	if (!deactivatedTeacher) {
		throw createHttpError.NotFound('Cannot find teacher to deactivate!')
	}
	return res.status(HttpStatusCode.CREATED).json(deactivatedTeacher)
})

// [GET] /users/parents/:classId
export const getParentsUserByClass = useCatchAsync(async (req: Request, res: Response) => {
	const parents = await UserService.getParentsUserByClass(req.params.classId)
	return res.status(HttpStatusCode.OK).json(parents)
})

// [GET] /users/search-parents
export const searchParentsUsers = useCatchAsync(async (req: Request, res: Response) => {
	const result = await UserService.searchParents(req.body.searchTerm)
	if (!result) throw createHttpError.NotFound('Cannot find any parents account!')
	return res.status(HttpStatusCode.OK).json(result)
})

// [GET] /users/:userId
export const getUserDetails = useCatchAsync(async (req: Request, res: Response) => {
	const user = await UserService.getUserDetails(req.params.userId)
	if (!user) throw createHttpError.NotFound('User not found!')
	return res.status(HttpStatusCode.OK).json(user)
})

// [PATCH] /user-update
export const updateUserInfo = useCatchAsync(async (req: Request, res: Response) => {
	const { error, value } = validateUpdateUserData(req.body)
	if (error) throw createHttpError.BadRequest(error.message)
	const profile = req.profile as Pick<IUser, '_id'>
	const updatedUser = await UserService.updateUserInfo(profile, value)
	if (!updatedUser) throw createHttpError.BadRequest('User does not exist!')
	return res.status(HttpStatusCode.CREATED).json(updatedUser)
})

// [PATCH] /users/parents/:userId
export const updateParentsInfo = useCatchAsync(async (req: Request, res: Response) => {
	const { parentsId } = req.params
	const { error, value } = validateNewParentsData(req.body)
	if (error) throw createHttpError.BadRequest(error.message)
	const updatedParentsUser = await UserService.updateParentsUserInfo(parentsId, value)
	if (!updatedParentsUser) throw createHttpError.NotFound('Cannot find parents user to update !')
	return res.status(HttpStatusCode.CREATED).json(updatedParentsUser)
})

export const getParentsByHeadTeacherClass = useCatchAsync(async (req: Request, res: Response) => {
	const headTeacherId = <string>req.profile._id
	const parents = await UserService.getParentsOfHeadTeacherClass(headTeacherId)
	return res.status(HttpStatusCode.OK).json(parents)
})
