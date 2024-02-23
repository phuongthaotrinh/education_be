import mongoose, { MongooseError } from 'mongoose'
import 'dotenv/config'
const connectMongoDB = async () => {
	try {
		mongoose.set('strictQuery', false)
		const isProductionEnv = process.env.NODE_ENV?.includes('production')
		isProductionEnv
			? console.log('[INFO] ::: Environment -> Production')
			: console.log('[INFO] ::: Environment -> Development')
		// const databaseUri = isProductionEnv ? process.env.MAIN_DB_URI! : process.env.TEST_DB_URI!;
		const data = await mongoose.connect(process.env.TEST_DB_URI!)
		console.log('[SUCCESS] ::: Connected to database')
		return data
	} catch (error) {
		console.log('[ERROR] ::: ', (error as MongooseError).message)
	}
}

export default connectMongoDB
