import { TTranscriptSchemaContext } from './../../types/subjectTranscription.type'
import Joi from 'joi'
import { ISubjectTranscript } from '../../types/subjectTranscription.type'

export const validateSubjectTranscript = (
	data: Omit<ISubjectTranscript, '_id' | 'subject' | 'schoolYear'>[],
	context: TTranscriptSchemaContext
) => {
	console.log(context)
	const semesterSchema = Joi.object({
		isPassed: Joi.boolean().when(Joi.ref('$isMainSubject'), {
			is: false,
			then: Joi.boolean().required(),
			otherwise: Joi.forbidden()
		}),
		midtermTest: Joi.number().when(Joi.ref('$isSeniorGrade'), {
			is: true,
			then: Joi.number().min(0).max(10).required(),
			otherwise: Joi.number().forbidden()
		}),
		// 	.concat(
		// 		Joi.number().when(Joi.ref('$isMainSubject'), {
		// 			is: true,
		// 			then: Joi.number().min(0).max(10).required(),
		// 			otherwise: Joi.number().forbidden()
		// 		})
		// )
		finalTest: Joi.when(Joi.ref('$isMainSubject'), {
			is: false,
			then: Joi.forbidden(),
			otherwise: Joi.number().min(0).max(10).required()
		})
	})
	const schema = Joi.object({
		student: Joi.string().required(),
		firstSemester: semesterSchema,
		secondSemester: semesterSchema
	})

	const arraySchema = Joi.array().items(schema)

	return arraySchema.validate(data, { context })
}
