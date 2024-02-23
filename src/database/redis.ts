import 'dotenv/config'
import * as redis from 'redis'
import { redisOptions } from '../configs/redis.config'

const redisClient = redis.createClient(redisOptions)

redisClient
	.connect()
	.then(() => {
		console.log('[SUCCESS] ::: Connected to Redis')
	})
	.catch((error) => {
		console.log('[ERROR] ::: ', error.message)
	})

redisClient.on('error', (error) => {
	console.log(error.message)
})

export default redisClient
