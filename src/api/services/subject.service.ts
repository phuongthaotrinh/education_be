import createHttpError from 'http-errors'
import mongoose, { isValidObjectId } from 'mongoose'
import { ISubject } from '../../types/subject.type'
import SubjectModel from '../models/subject.model'
import { validateSubjectRequestBody, validateSubjectUpdateBody } from '../validations/subject.validation'
import TimeTableModel from '../models/timeTable.model'

export const getAllSubjects = async () => await SubjectModel.find().sort({ subjectName: 1 })

export const getOneSubject = async (subjectId: string) => await SubjectModel.findById(subjectId)

export const createNewSubject = async (subject: Omit<ISubject, '_id'>) => {
	// check validate
	const { error, value } = validateSubjectRequestBody(subject)
	if (error) throw createHttpError.BadRequest(error.message)
	// check tồn tại
	const duplicatedSubjectCode = await SubjectModel.exists({
		subjectCode: subject.subjectCode.toUpperCase()
	})
	if (duplicatedSubjectCode) throw createHttpError.Conflict('Subject already exists')
	const newSubject = await new SubjectModel(value).save()
	return newSubject
}

// update
export const updateSubject = async (id: string, subject: Partial<Omit<ISubject, '_id'>>) => {
	if (!id) {
		throw createHttpError.BadRequest('Missing parameter')
	}
	const { error, value } = validateSubjectUpdateBody(subject)
	if (error) throw createHttpError.BadRequest(error.message)
	if (!isValidObjectId(id)) throw createHttpError.BadRequest('Invalid subject ID!')
	// check tồn tại
	const existedSubject = await SubjectModel.exists({ _id: id })
	if (!existedSubject) {
		throw createHttpError.NotFound('Subject does not exist')
	}
	const duplicatedSubjectCode = await SubjectModel.exists({
		_id: { $ne: id },
		subjectCode: subject.subjectCode?.toUpperCase()
	})

	if (duplicatedSubjectCode) throw createHttpError.Conflict('Subject code already existed!')
	return await SubjectModel.findOneAndUpdate({ _id: id }, value, { new: true })
}

// force delete
export const deleteSubject = async (id: string) => {
	if (!isValidObjectId(id)) throw createHttpError.BadRequest('_id of the subject is invalid')
	return await SubjectModel.deleteOne({ _id: id })
}

export const getSubjectAppliedForClass = async (grade: number) => {
	// const VALID_GRADES  = [1,2,3,4,5]
	// if (!VALID_GRADES.includes(grade)) throw createHttp
	return SubjectModel.find({ appliedForGrades: { $in: [grade] } })
}

export const getSubjectsUserTeachingInClass = async (classId: string, teacherId: string) => {
	const teachingSubjects = await TimeTableModel.aggregate()
		.match({
			class: new mongoose.Types.ObjectId(classId),
			teacher: new mongoose.Types.ObjectId(teacherId)
		})
		.lookup({
			from: 'subjects',
			localField: 'subject',
			foreignField: '_id',
			as: 'subject',
			pipeline: [
				{
					$project: {
						_id: 1,
						subjectName: 1,
						isMainSubject: 1
					}
				}
			]
		})
		.group({
			_id: '$subject'
		})

	return teachingSubjects.map((sbj) => sbj._id).flat()
}

export const getAllSubjectOfStudentStudying = async (classId: string) => {
	const subjects = await TimeTableModel.aggregate()
		.match({ class: new mongoose.Types.ObjectId(classId) })
		.lookup({
			from: 'subjects',
			localField: 'subject',
			foreignField: '_id',
			as: 'subject',
			pipeline: [
				{
					$project: {
						subjectName: 1,
						isMainSubject: 1,
						isElectiveSubject: 1
					}
				},
				{
					$sort: {
						subjectName: 1 // Sort by subjectName in ascending order
					}
				}
			]
		})
		.group({ _id: '$subject' })

	return subjects.map((sbj) => sbj._id).flat()
}
