import { groupBy } from 'lodash'
import mongoose, { Schema } from 'mongoose'
import { NAME_LEVEL } from '../../constants/nameLevel'
import { IClass } from '../../types/class.type'
import { IStudent, StudentStatusEnum } from '../../types/student.type'
import { ISubject } from '../../types/subject.type'
import { ISubjectTranscript } from '../../types/subjectTranscription.type'
import ClassModel from '../models/class.model'
import SchoolYearModel from '../models/schoolYear.model'
import StudentModel from '../models/student.model'

export const handleTranscriptStudent = (transcriptStudents: ISubjectTranscript[], students: IStudent[]): any => {
	return transcriptStudents
		.map((transcriptStudent) => {
			const studentCurrent = students.find((item) => String(item._id) === String(transcriptStudent.student))
			const subject = transcriptStudent.subject as ISubject

			if (subject.isElectiveSubject || !studentCurrent) {
				return undefined
			}

			// Môn tính bằng điểm
			if (subject.isMainSubject) {
				// Khối 1,2
				if (
					studentCurrent?.class &&
					typeof studentCurrent.class !== 'string' &&
					[1, 2].includes((studentCurrent.class as IClass).grade)
				) {
					const secondSemester =
						transcriptStudent?.secondSemester?.finalTest || transcriptStudent?.secondSemester?.isPassed

					return {
						mediumScore: secondSemester,
						student: studentCurrent._id
					}
				}

				// Các khối còn lại
				const secondSemester = transcriptStudent?.secondSemester?.midtermTest

				return {
					mediumScore: secondSemester,
					student: studentCurrent._id
				}
			}

			// Môn tính bằng nhận sét
			return {
				isPassed: transcriptStudent.secondSemester?.isPassed,
				student: studentCurrent._id
			}
		})
		.filter((item) => item !== undefined)
}

export const getStdPercentageByGrade = async () => {
	const allGrades = [1, 2, 3, 4, 5]
	const labels = ['Khối 1', 'Khối 2', 'Khối 3', 'Khối 4', 'Khối 5']
	const data = await Promise.all(
		allGrades.map(async (g) => {
			const aggregateResult = await StudentModel.aggregate([
				{ $lookup: { from: 'classes', localField: 'class', foreignField: '_id', as: 'class' } },
				{ $unwind: '$class' },
				{ $match: { 'class.grade': g } },
				{ $count: g.toString() }
			])
			return aggregateResult.at(0) ? aggregateResult.at(0)[g] : 0
		})
	)

	return {
		labels,
		datasets: [
			{
				label: 'Tỉ lệ học sinh giữa các khối',
				data: data,
				backgroundColor: '#34d39950'
			}
		]
	}
}

export const getPolicyBeneficiary = async () => {
	try {
		const classes: IClass[] = await ClassModel.find({ isTemporary: false })
			.select('_id className')
			.sort({ grade: 'asc' })
		const allClassId = classes.map((classItem) => classItem._id)

		const data = await Promise.all(
			allClassId.map(async (classId) => {
				const policyStudent: IStudent[] = await StudentModel.find({
					class: classId,
					isPolicyBeneficiary: true
				})

				return policyStudent.length
			})
		)
		return {
			labels: classes.map((item) => item.className),
			datasets: [
				{
					label: 'Học sinh hoàn cảnh',
					data: data,
					backgroundColor: '#6366f150'
				}
			]
		}
	} catch (error) {
		throw error
	}
}

// Xếp hạng học lực học sinh toàn trường
export const getStdAllClass = async (schoolYear?: string) => {
	const [currentSchoolYear] = await SchoolYearModel.find().sort({ endAt: -1 })

	const classes: IClass[] = await ClassModel.find({ isTemporary: false }).sort({ grade: 'asc' })
	const classIds = classes.map((item) => item._id)

	const studyRanking = await StudentModel.aggregate([
		{ $match: { status: { $ne: StudentStatusEnum.WAITING_ARRANGE_CLASS } } },
		{
			$lookup: {
				from: 'classes',
				localField: 'class',
				foreignField: '_id',
				as: 'class',
				pipeline: [
					{
						$project: { grade: 1, className: 1 }
					}
				]
			}
		},
		{ $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },
		{
			$lookup: {
				from: 'subject_transcriptions',
				localField: '_id',
				let: { studentId: '$_id' },
				foreignField: 'student',
				as: 'studyRanking',
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{ $eq: ['$student', '$$studentId'] },
									{
										$eq: ['$schoolYear', new mongoose.Types.ObjectId(schoolYear) || currentSchoolYear?._id]
									}
								]
							}
						}
					}
				]
			}
		},
		{
			$addFields: {
				studyRanking: {
					$cond: {
						if: {
							$or: [
								{
									$and: [
										{ $in: ['$class.grade', [1, 2]] },
										{ $eq: [{ $size: '$studyRanking' }, 9] },
										{
											$eq: [
												{
													$size: {
														$filter: {
															input: '$studyRanking',
															as: 'item',
															cond: {
																$or: [
																	{ $eq: ['$$item.secondSemester.isPassed', true] },
																	{ $gte: ['$$item.secondSemester.finalTest', 9] }
																]
															}
														}
													}
												},
												9
											]
										}
									]
								},
								{
									$and: [
										{ $in: ['$class.grade', [3, 4, 5]] },
										{ $eq: [{ $size: '$studyRanking' }, 11] },
										{
											$eq: [
												{
													$size: {
														$filter: {
															input: '$studyRanking',
															as: 'item',
															cond: {
																$or: [
																	{ $eq: ['$$item.secondSemester.isPassed', true] },
																	{ $gte: ['$$item.secondSemester.finalTest', 9] }
																]
															}
														}
													}
												},
												11
											]
										}
									]
								}
							]
						},
						then: 1,
						else: {
							$cond: {
								if: {
									$or: [
										{
											$and: [
												{ $in: ['$class.grade', [1, 2]] },
												{ $eq: [{ $size: '$studyRanking' }, 9] },
												{
													$eq: [
														{
															$size: {
																$filter: {
																	input: '$studyRanking',
																	as: 'item',
																	cond: {
																		$or: [
																			{ $eq: ['$$item.secondSemester.isPassed', true] },
																			{ $gte: ['$$item.secondSemester.finalTest', 5] }
																		]
																	}
																}
															}
														},
														9
													]
												}
											]
										},
										{
											$and: [
												{ $in: ['$class.grade', [3, 4, 5]] },
												{ $eq: [{ $size: '$studyRanking' }, 11] },
												{
													$eq: [
														{
															$size: {
																$filter: {
																	input: '$studyRanking',
																	as: 'item',
																	cond: {
																		$or: [
																			{ $eq: ['$$item.secondSemester.isPassed', true] },
																			{ $gte: ['$$item.secondSemester.finalTest', 5] }
																		]
																	}
																}
															}
														},
														11
													]
												}
											]
										}
									]
								},
								then: 2,
								else: 3
							}
						}
					}
				}
			}
		},
		{ $project: { fullName: 1, code: 1, studyRanking: 1, class: 1 } },
		{
			$group: {
				_id: { class: '$class', studyRanking: '$studyRanking' },

				count: { $sum: 1 }
			}
		}
	])

	const ranking = groupBy(
		studyRanking.map((item) => ({ ...item, ...item._id })).filter((item) => !!item.class),
		'class.className'
	) as { [key: string]: any }

	return {
		labels: classes.map((item) => item.className),
		datasets: [
			{
				label: NAME_LEVEL.level1,
				data: classes.map((cls) => {
					const className = cls.className
					return ranking[className].find((item: { studyRanking: number }) => item.studyRanking === 1)?.count
				}),
				backgroundColor: '#34d39950'
			},
			{
				label: NAME_LEVEL.level2,
				data: classes.map((cls) => {
					const className = cls.className
					return ranking[className].find((item: { studyRanking: number }) => item.studyRanking === 2)?.count
				}),
				backgroundColor: '#0ea5e950'
			},
			{
				label: NAME_LEVEL.level3,
				data: classes.map((cls) => {
					const className = cls.className
					return ranking[className].find((item: { studyRanking: number }) => item.studyRanking === 3)?.count
				}),
				backgroundColor: '#f43f5e50'
			}
		]
	}
}
