import createHttpError from 'http-errors'
import { ObjectId } from 'mongoose'
import { IStudentRemark } from '../../types/student.type'
import ClassModel from '../models/class.model'
import StudentRemarkModel from '../models/studentRemark.model'
import { getHeadTeacherClass } from './class.service'
import { getStudentsByClass } from './student.service'
import { validateNewStudentRemark } from '../validations/studentRemark.validation'
import { getCurrentSchoolYear } from './schoolYear.service'
import { faker } from '@faker-js/faker'
import StudentModel from '../models/student.model'

export const createStudentRemarkEntireClass = async (
	data: Array<Omit<IStudentRemark, '_id'>>,
	headTeacherId: string | ObjectId
) => {
	const currentSchoolYear = await getCurrentSchoolYear()
	const currentClass = await ClassModel.findOne({ headTeacher: headTeacherId })
	if (!currentClass) throw createHttpError.Forbidden('Only head teacher can remark conduct for this student !')
	const payload = data.map(
		(item) =>
			({
				...item,
				schoolYear: currentSchoolYear._id?.toString(),
				remarkedBy: headTeacherId
			} as Omit<IStudentRemark, '_id'>)
	)
	const { error, value } = validateNewStudentRemark(payload)
	if (error) throw createHttpError.BadRequest(error.message)
	const bulkWriteOptions = value.map((v: IStudentRemark) => ({
		updateOne: {
			filter: { student: v.student, schoolYear: currentSchoolYear },
			update: v,
			upsert: true
		}
	}))
	await StudentRemarkModel.bulkWrite(bulkWriteOptions)
	return { message: `Insert students's remark for this class successfully !` }
}

export const getStudentRemarkByClass = async <T extends string | ObjectId>(headTeacherId: T) => {
	const currentSchoolYear = await getCurrentSchoolYear()
	const currentClass = await getHeadTeacherClass(headTeacherId as string)
	const studentsOfClass = await StudentModel.find({ class: currentClass?._id }).distinct('_id')
	if (!currentClass) throw createHttpError.NotFound("Can't find the current class")

	const remarkList = await StudentRemarkModel.find({
		schoolYear: currentSchoolYear?._id,
		remarkedBy: headTeacherId,
		student: { $in: studentsOfClass }
	})

	if (!remarkList) throw createHttpError.NotFound("Can't get student remarks for the current class!")

	return remarkList
}

export const getStudentRemark = async (studentId: string, schoolYearId: string) => {
	return await StudentRemarkModel.findOne({ student: studentId, schoolYear: schoolYearId })
}

export const generateFakeStudentRemark = async <T extends string | ObjectId>(headTeacherId: T) => {
	const currentSchoolYear = await getCurrentSchoolYear()
	const currentClass = await ClassModel.findOne({ headTeacher: headTeacherId })

	if (!currentClass) throw createHttpError.NotFound("Can't find the current class")

	const students = await getStudentsByClass(currentClass._id as unknown as string)

	if (!students.length) throw createHttpError.NotFound("Can't find any students!")

	const data = students.map((stu) => generateRemark(stu._id, currentSchoolYear._id, headTeacherId))

	await StudentRemarkModel.insertMany(data)

	return await getStudentRemarkByClass(headTeacherId)
}

function generateRemark<T extends string | ObjectId>(studentId: T, schoolYear: T, headTeacherId: T) {
	const REMARKS = ['Tốt', 'Đạt', 'Cần cố gắng']

	return {
		student: studentId || faker.string.uuid(),
		schoolYear: schoolYear || faker.string.uuid(),
		conduct: faker.helpers.arrayElement(REMARKS),
		proficiency: faker.helpers.arrayElement(REMARKS),
		isQualified: faker.datatype.boolean(),
		remarkedBy: headTeacherId || faker.string.uuid()
	}
}
