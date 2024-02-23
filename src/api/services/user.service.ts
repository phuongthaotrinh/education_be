import { genSaltSync, hashSync } from 'bcrypt'
import createHttpError from 'http-errors'
import removeVietnameseTones from '../../helpers/vnFullTextSearch'
import { IUser } from '../../types/user.type'
import UserModel from '../models/user.model'
import { UserRoleEnum } from './../../types/user.type'
import { sendMail } from './mail.service'
import { getDeactivateUserEmail } from '../../helpers/mailTemplates'
import ClassModel from '../models/class.model'

export const createUser = async (payload: Partial<IUser> & Array<Partial<IUser>>) => {
	if (Array.isArray(payload) && payload.every((user) => user.role === UserRoleEnum.PARENTS)) {
		const hasExistedUser = await UserModel.exists({
			$or: [
				{ email: { $in: payload.map((user) => user.email) } },
				{ phone: { $in: payload.map((user) => user.phone) } }
			]
		})
		if (hasExistedUser) throw createHttpError.Conflict(`Parents's phone number or email cannot be duplicated!`)
		return await UserModel.insertMany(payload)
	}
	// Add a new teacher user
	if (payload.role === UserRoleEnum.TEACHER) {
		const existedTeacher = await UserModel.exists({
			$or: [
				{
					email: payload.email
				},
				{
					phone: payload.phone
				}
			]
		})
		if (existedTeacher) {
			throw createHttpError.BadRequest(`Teacher's email or phone number cannot be duplicated!`)
		}

		return await new UserModel({ ...payload, employmentStatus: false }).save()
	}
}

// Users update them self account's info
export const updateUserInfo = async (authId: Pick<IUser, '_id'>, payload: Partial<IUser>) => {
	const existedUser = await UserModel.findOne({
		_id: { $ne: authId },
		$or: [{ phone: payload.phone }, { email: payload.email }]
	})
	if (existedUser) throw createHttpError.Conflict('User having this email or phone number already existed !')
	return await UserModel.findOneAndUpdate({ _id: authId._id }, payload, {
		new: true
	})
}

// Headmaster update teacher user's info
export const updateTeacherInfo = async (teacherId: string, payload: Partial<IUser>) => {
	const existedUser = await UserModel.findOne({
		_id: { $ne: teacherId },
		$or: [{ phone: payload.phone }, { email: payload.email }]
	})
	if (existedUser) throw createHttpError.Conflict('User having this email or phone number already existed !')
	return await UserModel.findOneAndUpdate({ _id: teacherId, role: UserRoleEnum.TEACHER }, payload, {
		new: true
	}).lean()
}

export const updateParentsUserInfo = async (parentsId: string, payload: Partial<IUser>) => {
	const existedUser = await UserModel.findOne({
		_id: { $ne: parentsId },
		$or: [{ phone: payload.phone }, { email: payload.email }]
	})
	if (existedUser) throw createHttpError.Conflict('User having this email or phone number already existed !')
	return await UserModel.findOneAndUpdate({ _id: parentsId, role: UserRoleEnum.PARENTS }, payload, {
		new: true
	}).lean()
}

export const getUserDetails = async (userId: string) => await UserModel.findOne({ _id: userId }).lean()

export const changePassword = async (userId: string, newPassword: string) => {
	const encryptedNewPassword = hashSync(newPassword, genSaltSync(Number(process.env.SALT_ROUND)))
	return await UserModel.findOneAndUpdate({ _id: userId }, { password: encryptedNewPassword }, { new: true })
}

export const getTeacherUsersByStatus = async (status?: string) => {
	switch (status) {
		case 'inactive':
			return await UserModel.find({
				role: UserRoleEnum.TEACHER,
				isVerified: false
			})

		// In working teacher
		case 'in_working':
			return await UserModel.find({
				role: UserRoleEnum.TEACHER,
				employmentStatus: true
			})

		default:
			return await UserModel.find({
				role: UserRoleEnum.TEACHER
			})
	}
}

export const deactivateTeacherUser = async (userId: string) => {
	return await UserModel.findOneAndDelete({ _id: userId, role: UserRoleEnum.TEACHER })
}

export const getParentsUserByClass = async (classId: string) => {
	const parents = await UserModel.find({ role: UserRoleEnum.PARENTS })
		.populate({
			path: 'children',
			select: 'fullName class -parents',
			match: { class: classId },
			populate: { path: 'class', select: 'className' }
		})
		.lean()
		.transform((docs) => docs.filter((doc) => doc.children.length > 0))

	return parents
}

export const searchParents = async (searchTerm: string) => {
	const pattern = new RegExp(`^${searchTerm}`, 'gi')
	return await UserModel.find({
		$or: [
			{ phone: pattern, role: UserRoleEnum.PARENTS },
			{
				displayName: removeVietnameseTones(searchTerm),
				role: UserRoleEnum.PARENTS
			},
			{ email: pattern, role: UserRoleEnum.PARENTS }
		]
	}).lean()
}

export const updateUserPicture = async (user: Pick<IUser, '_id'>, pictureUrl: string) =>
	await UserModel.findOneAndUpdate({ _id: user._id }, { picture: pictureUrl }, { new: true })

export const deactivateParentsUser = async (
	parents: Pick<IUser, '_id' | 'email'> | Array<Pick<IUser, '_id' | 'email'>>
) => {
	if (Array.isArray(parents)) {
		const deactivatedParents = await UserModel.deleteMany({ _id: { $in: parents } })
		const sendMailPromises = parents.map(
			(user) => new Promise((resolve) => sendMail(getDeactivateUserEmail(user)).catch((error) => resolve(error)))
		)
		await Promise.all(sendMailPromises)
		return deactivatedParents
	}
	const deactivatedParents = await UserModel.findOneAndDelete({ _id: parents._id })
	await sendMail(getDeactivateUserEmail(parents as Pick<IUser, 'email' | '_id'>))
	return deactivatedParents
}

export const getUserByEmail = async (email: string) =>
	await UserModel.findOne({ email })
		.select('_id displayName role phone email')
		.transform((doc) => ({ ...doc?.toObject(), _id: doc?._id.toString() }))

export const getParentsOfHeadTeacherClass = async (headTeacherId: string) => {
	const classOfHeadTeacher = await ClassModel.findOne({ headTeacher: headTeacherId }).select('_id')
	if (!classOfHeadTeacher) throw createHttpError.NotFound('You have not play a role as a head teacher for any class !')
	return await getParentsUserByClass(classOfHeadTeacher._id.toString())
}
