import 'dotenv/config'

export const redisOptions = {
	password: process.env.REDIS_PASSWORD!,
	socket: {
		host: process.env.REDIS_HOST!,
		port: +process.env.REDIS_PORT!,
		noDelay: false,
		keepAlive: -1,
		connectionTimeOut: 5000
	}
}
