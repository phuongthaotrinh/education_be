/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcrypt, { genSaltSync } from 'bcrypt'
import 'dotenv/config'
import mongoose from 'mongoose'
import mongooseAutoPopulate from 'mongoose-autopopulate'
import mongooseDelete from 'mongoose-delete'

import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import { toCapitalize } from '../../helpers/toolkit'
import { IUser, IUserDocument, UserGenderEnum, UserRoleEnum } from '../../types/user.type'

const UserSchema = new mongoose.Schema<IUser>(
	{
		email: {
			type: String,
			trim: true,
			unique: true
		},
		phone: {
			type: String,
			required: true,
			unique: true
		},
		displayName: {
			type: String,
			required: true,
			trim: true
		},
		dateOfBirth: {
			type: Date,
			required: true
		},
		address: {
			type: String,
			required: true
		},
		gender: {
			type: String,
			required: true,
			enum: Object.values(UserGenderEnum)
		},
		picture: {
			type: String,
			trim: true
		},
		eduBackground: {
			type: {
				qualification: String, // học vấn
				universityName: String, // tên trường đã tốt nghiệp
				graduatedAt: Date
			},
			_id: false,
			default: null
		},
		employmentStatus: {
			type: Boolean,
			default: false
		},
		role: {
			type: String,
			trim: true,
			required: true,
			enum: Object.values(UserRoleEnum)
		},
		isVerified: {
			type: Boolean,
			default: false
		}
	},
	{
		timestamps: true,
		versionKey: false,
		toJSON: { virtuals: true },
		autoIndex: true
	}
)
UserSchema.index({ displayName: 'text' })
UserSchema.virtual('children', {
	localField: '_id',
	foreignField: 'parents',
	ref: 'Students'
})

UserSchema.virtual('userStatusText').get(function () {
	switch (true) {
		case this.isVerified === false:
			return 'Chưa kích hoạt'
		case this.employmentStatus && this.isVerified:
			return 'Đang làm việc'
		case this.employmentStatus === false:
			return 'Đã nghỉ việc'
	}
})

UserSchema.methods.verifyPassword = function (password: string) {
	if (!password) return false
	return bcrypt.compareSync(password, this.password)
}

UserSchema.pre('save', function (next) {
	if (this.password) {
		this.password = bcrypt.hashSync(this.password, genSaltSync(+process.env.SALT_ROUND!))
	}
	this.displayName = toCapitalize(this.displayName)!
	next()
})

// UserSchema.plugin(mongooseDelete, {
// 	overrideMethods: ['find', 'findOne', 'findOneAndUpdate'],
// 	deletedAt: true
// })
UserSchema.plugin(mongooseLeanVirtuals)
UserSchema.plugin(mongooseAutoPopulate)

const UserModel = mongoose.model<IUserDocument>('Users', UserSchema)
UserModel.createIndexes()

export default UserModel
