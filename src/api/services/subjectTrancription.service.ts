import createHttpError from 'http-errors'
import mongoose, { ObjectId, isValidObjectId } from 'mongoose'
import { IClass } from '../../types/class.type'
import { IStudent } from '../../types/student.type'
import { ISubjectTranscript } from '../../types/subjectTranscription.type'
import ClassModel from '../models/class.model'
import StudentModel from '../models/student.model'
import SubjectModel from '../models/subject.model'
import SubjectTranscriptionModel from '../models/subjectTrancription.model'
import { validateSubjectTranscript } from '../validations/subjectTrancription.validation'
import { getCurrentSchoolYear } from './schoolYear.service'
import TimeTableModel from '../models/timeTable.model'
import { getAllSubjectOfStudentStudying } from './subject.service'

// Nhập điểm nhiều học sinh 1 lúc / môn / lớp
export const insertSubjectTranscriptByClass = async (
	subjectId: string,
	classId: string,
	data: Omit<ISubjectTranscript, '_id' | 'subject' | 'schoolYear'>[]
) => {
	if (!isValidObjectId(classId) || !isValidObjectId(subjectId))
		throw createHttpError.BadRequest(`Class's ID or subject's ID is invalid ObjectId`)

	if (!Array.isArray(data) || data.length === 0)
		throw createHttpError.BadRequest('Body data must be an array and cannot be empty!')

	const [currentSchoolYear, currentClass, currentSubject, isAllStudentInClass] = await Promise.all([
		getCurrentSchoolYear(),
		ClassModel.findOne({ _id: classId }),
		SubjectModel.findOne({ _id: subjectId }),
		StudentModel.exists({
			$and: [{ _id: { $in: data.map((std) => std.student) } }, { class: classId }]
		})
	])
	if (!currentClass) throw createHttpError.NotFound('Class does not exist or has been deleted!')

	// Check if subject submit for transcript does exist
	if (!currentSubject) throw createHttpError.NotFound('Subject does not exist or has been deleted!')

	// Check tất cả học sinh trong bảng điểm gửi lên có nằm trong lớp
	if (!isAllStudentInClass) throw createHttpError.Conflict('Some students do not exist in this class !')

	// validate bảng điểm của các student gửi lên
	// const { error, value } = validateSubjectTranscript(data, {
	// 	isMainSubject: currentSubject.isMainSubject,
	// 	isSeniorGrade: currentClass.grade > 3
	// })
	// if (error) throw createHttpError.BadRequest(error.message)

	const bulkWriteOption: any = data.map((item: any) => ({
		updateOne: {
			filter: {
				student: item.student,
				subject: subjectId,
				schoolYear: currentSchoolYear?._id
			},
			update: item,
			upsert: true
		}
	}))

	return await SubjectTranscriptionModel.bulkWrite(bulkWriteOption)
}

// lấy bảng điểm của tất học sinh trong 1 lớp theo môn học
export const getSubjectTranscriptByClass = async (classId: string, subjectId: string) => {
	if (!classId || !subjectId || !isValidObjectId(classId) || !isValidObjectId(subjectId)) {
		throw createHttpError.BadRequest('classId or subjectId is not in the correct ObjectId format')
	}
	// lấy ra schoolYear hiện tại
	const schoolYear = await getCurrentSchoolYear()

	// lấy ra list học sinh của lớp

	const [listStudent, subject, currentClass] = await Promise.all([
		StudentModel.find({
			class: classId,
			dropoutDate: null,
			transferSchool: null
		})
			.select('_id fullName code')
			.lean(),
		SubjectModel.findById(subjectId),
		ClassModel.findById(classId)
	])
	if (!subject || !currentClass) throw createHttpError.NotFound('Cannot find subject or class to get transcript !')
	if (!subject.appliedForGrades.includes(currentClass.grade))
		throw createHttpError.UnprocessableEntity('Subject cannot be applied to transcript for this class !')
	// lấy ra bảng điểm của những học sinh đó
	let transcriptStudentList: Array<Partial<ISubjectTranscript>> = await SubjectTranscriptionModel.find({
		student: { $in: listStudent.map((student) => student._id) },
		schoolYear: schoolYear._id,
		subject: subjectId
	})
		.populate({ path: 'student', select: '_id fullName code' })
		.select('student firstSemester secondSemester')
		.transform((docs) =>
			docs.map((doc) => ({
				...doc.toObject(),
				student: doc.student?._id,
				fullName: doc.student.fullName,
				code: doc.student.code
			}))
		)

	const isSeniorGrade = <number>currentClass?.grade > 3
	if (!transcriptStudentList.length || transcriptStudentList.length < listStudent.length) {
		transcriptStudentList = <Array<Partial<ISubjectTranscript>>>listStudent.map((std) => {
			const existedTranscriptOfStudent = transcriptStudentList.find(
				(item) => item.student?.toString() === std._id.toString()
			)

			switch (true) {
				case !!existedTranscriptOfStudent:
					return existedTranscriptOfStudent

				case subject?.isMainSubject:
					if (isSeniorGrade)
						return {
							student: std._id,
							fullName: std.fullName,
							code: std.code,
							firstSemester: {
								midtermTest: 0,
								finalTest: 0
							},
							secondSemester: {
								midtermTest: 0,
								finalTest: 0
							}
						}
					return {
						student: std._id,
						fullName: std.fullName,
						code: std.code,
						firstSemester: {
							finalTest: 0
						},
						secondSemester: {
							finalTest: 0
						}
					}

				default:
					return {
						student: std._id,
						fullName: std.fullName,
						code: std.code,
						firstSemester: {
							isPassed: false
						},
						secondSemester: {
							isPassed: false
						}
					}
			}
		})
	}
	return transcriptStudentList
}

// lấy ra bảng điểm 1 học sinh với tất cả môn
export const getStudentTranscript = async (id: string | ObjectId, schoolYear: string) => {
	if (!isValidObjectId(id)) {
		throw createHttpError.BadRequest('Invalid student ID !')
	}
	if (!isValidObjectId(schoolYear)) {
		throw createHttpError.BadRequest('Invalid school year ID!')
	}
	const student: null | IStudent = await StudentModel.findOne({
		_id: id,
		dropoutDate: null,
		transferSchool: null
	}).populate({ path: 'class' })

	if (!student) {
		throw createHttpError.NotFound('Student does not exist')
	}

	const studentClass = student.class as Partial<IClass>
	const studentGrade = studentClass?.grade as number
	const totalSubjectsOfTranscript = [1, 2].includes(studentGrade) ? 9 : 11
	const validSchoolYearsStdTranscripts = await getValidSchoolYearOfStudentTranscript(student._id.toString())

	const isValidSchoolYear = validSchoolYearsStdTranscripts.map((scy) => scy._id.toString()).includes(schoolYear)

	if (!isValidSchoolYear) {
		throw createHttpError.NotFound('Student does not has transcript in this school year!')
	}
	const latestSchoolYear = validSchoolYearsStdTranscripts.at(0)._id
	const studentTranscripts = await SubjectTranscriptionModel.aggregate()
		.match({
			student: student._id,
			schoolYear: isValidSchoolYear ? new mongoose.Types.ObjectId(schoolYear) : latestSchoolYear
		})
		.lookup({
			from: 'students',
			localField: 'student',
			foreignField: '_id',
			as: 'student',
			pipeline: [
				{
					$project: {
						_id: 1,
						fullName: 1
					}
				}
			]
		})
		.unwind('$student')
		.lookup({
			from: 'subjects',
			localField: 'subject',
			foreignField: '_id',
			as: 'subject',
			pipeline: [
				{
					$project: {
						_id: 1,
						subjectName: 1
					}
				}
			]
		})
		.unwind('$subject')
		.lookup({
			from: 'school_years',
			localField: 'schoolYear',
			foreignField: '_id',
			as: 'schoolYear',
			pipeline: [
				{
					$project: {
						_id: 1,
						name: 1
					}
				}
			]
		})
		.group({
			_id: '$student',
			student: { $first: '$student' },
			schoolYear: { $first: '$schoolYear' },
			transcript: {
				$push: {
					subject: '$subject',
					firstSemester: '$firstSemester',
					secondSemester: '$secondSemester',
					isPassed: '$isPassed'
				}
			}
		})
		.addFields({
			completedProgram: {
				$and: [
					{ $eq: [{ $size: '$transcript' }, totalSubjectsOfTranscript] },
					{
						$eq: [
							{
								$setEquals: [
									{
										$map: {
											input: '$transcript',
											as: 'transcript',
											in: '$$transcript.isPassed'
										}
									},
									Array(totalSubjectsOfTranscript).fill(true)
								]
							},
							true
						]
					}
				]
			}
		})
		.project({
			_id: 0,
			transcript: 1,
			student: 1,
			schoolYear: 1,
			completedProgram: 1
		})

	return studentTranscripts.at(0)
}

// Lấy bảng điểm tất cả các môn của 1 lớp
export const getTranscriptsByClass = async (classId: string | ObjectId, schoolYear: ObjectId) => {
	if (!isValidObjectId(classId)) throw createHttpError.BadRequest('Invalid class ID')

	const [listStudent, [grade], AllStudyingSubjects] = await Promise.all([
		StudentModel.find({
			class: classId,
			dropoutDate: null,
			transferSchool: null
		}).select('_id fullName'),
		ClassModel.findOne({ _id: classId }).distinct('grade'),
		getAllSubjectOfStudentStudying(<string>classId)
	])

	// Khối 1,2 chỉ có 9 môn, khối 3,4,5 có 11 môn
	const JUNIOR_GRADES = [1, 2]
	const TOTAL_SBJ_OF_JUNIOR_STUDENT = 9
	const TOTAL_SBJ_OF_SENIOR_STUDENT = 11

	const totalSubjects = JUNIOR_GRADES.includes(grade) ? TOTAL_SBJ_OF_JUNIOR_STUDENT : TOTAL_SBJ_OF_SENIOR_STUDENT

	let data = await SubjectTranscriptionModel.aggregate()
		.match({
			student: { $in: listStudent.map((student) => student._id) },
			schoolYear: schoolYear
		})
		.lookup({
			from: 'subjects',
			foreignField: '_id',
			localField: 'subject',
			as: 'subject',
			pipeline: [
				{
					$project: {
						subjectName: 1
					}
				}
			]
		})
		.unwind('$subject')
		.lookup({
			from: 'students',
			foreignField: '_id',
			localField: 'student',
			as: 'student',
			pipeline: [
				{
					$project: {
						_id: 1,
						fullName: 1,
						class: 1
					}
				}
			]
		})
		.unwind('$student')
		.group({
			_id: '$student',
			student: { $first: '$student' },
			transcript: {
				$push: {
					k: '$subject.subjectName',
					v: {
						firstSemester: '$firstSemester',
						secondSemester: '$secondSemester'
					}
				}
			}
		})
		.addFields({
			transcript: { $arrayToObject: '$transcript' },
			completedProgram: {
				$and: [
					{ $eq: [{ $size: '$transcript' }, totalSubjects] },
					{
						$eq: [
							{
								$setEquals: [
									{
										$map: {
											input: '$transcript',
											as: 'transcript',
											in: '$$transcript.v.isPassed'
										}
									},
									Array(totalSubjects).fill(true)
								]
							},
							true
						]
					}
				]
			}
		})
		.sort({ student: 1 })
		.project({
			_id: 0,
			student: 1,
			transcript: 1,
			completedProgram: 1
		})
	const isLackOfSubjectInTranscript = data.every(
		(item) => Object.keys(item.transcript).length < AllStudyingSubjects.length
	)

	if (isLackOfSubjectInTranscript) {
		const existedSubjectsInEachTranscript = data.at(0)?.transcript ? Object.keys(data.at(0)?.transcript) : []
		const lackingSubjects = AllStudyingSubjects.filter(
			(sbj) => !existedSubjectsInEachTranscript.some((ex) => ex === sbj?.subjectName)
		)
		const defaultTranscriptOfLackingSbj: {
			[key: string]: Pick<ISubjectTranscript, 'firstSemester' | 'secondSemester'> & {
				hasNoData?: boolean
			}
		} = {}
		lackingSubjects.forEach((sbj) => {
			// Nếu khối lớp hiện tại là từ khối 4 trở lên thì sẽ có điểm giữa kỳ đối với môn xét = điểm
			if (sbj.isMainSubject) {
				if (grade > 4)
					defaultTranscriptOfLackingSbj[sbj.subjectName] = {
						firstSemester: {
							midtermTest: 0,
							finalTest: 0
						},
						secondSemester: {
							midtermTest: 0,
							finalTest: 0
						},
						hasNoData: true
					}
				else
					defaultTranscriptOfLackingSbj[sbj.subjectName] = {
						[sbj.subjectName]: {
							firstSemester: {
								finalTest: 0
							},
							secondSemester: {
								finalTest: 0
							},
							hasNoData: true
						}
					}
			} else {
				defaultTranscriptOfLackingSbj[sbj.subjectName] = {
					firstSemester: {
						isPassed: false
					},
					secondSemester: {
						isPassed: false
					},
					hasNoData: true
				}
			}
		})

		if (data.length > 0) {
			data = data.map((item) => {
				const transformedItem = {
					...item,
					student: item.student?.fullName,
					...item.transcript,
					...defaultTranscriptOfLackingSbj
				}
				console.log(transformedItem)
				return transformedItem
			})
		} else {
			data = listStudent.map((student) => ({
				...defaultTranscriptOfLackingSbj,
				student: student.fullName,
				completedProgram: false
			}))
		}
	} else {
		data = data.map((doc) => {
			const { transcript, ...rest } = doc
			return { ...rest, ...transcript, student: doc.student?.fullName }
		})
	}

	return {
		// teachingSubjects:
		studyingSubjects: AllStudyingSubjects.map((sbj) => sbj.subjectName).sort((a, b) => a.localeCompare(b)),
		transcripts: data
	}
}

export const getValidSchoolYearOfStudentTranscript = async (studentId: string) => {
	const [existedSchoolYear, currentSchoolYear] = await Promise.all([
		SubjectTranscriptionModel.aggregate()
			.match({ student: new mongoose.Types.ObjectId(studentId) })
			.lookup({
				from: 'school_years', // replace with your SchoolYear collection name
				localField: 'schoolYear',
				foreignField: '_id',
				as: 'schoolYear',
				pipeline: [{ $sort: { endAt: -1 } }]
			})
			.unwind('$schoolYear')
			.group({ _id: '$schoolYear' })
			.sort({ endAt: -1 }),
		getCurrentSchoolYear()
	])
	const availableSchoolYears = existedSchoolYear.map((s) => s._id)
	const result = !availableSchoolYears.some((scy) => scy._id.equals(currentSchoolYear._id))
		? [...availableSchoolYears, currentSchoolYear]
		: availableSchoolYears

	return result
}

export const getSubjectTeacherCanInsertTranscript = async (userId: string, subjectId: string, classId: string) => {
	return await TimeTableModel.exists({
		teacher: userId,
		subject: subjectId,
		class: classId
	})
}
