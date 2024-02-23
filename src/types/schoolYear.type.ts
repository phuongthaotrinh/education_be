import { ObjectId, PaginateModel } from 'mongoose'

export interface ISchoolYear extends Document {
	_id: ObjectId
	name: string
	startAt: Date
	endAt: Date
}

export type TPaginatedSchoolYearModel = PaginateModel<ISchoolYear>
