import 'dotenv/config'
import app from './app'
import connectMongoDB from './database/mongodb'
import './database/redis'
import './types/global'

const PORT = process.env.PORT || 3004

app.listen(PORT, () => {
	console.log(`[SUCCESS] ::: Server is listening on port: ${PORT}`)
	console.log(`[INFO] ::: API document available on: http://localhost:${PORT}/api/document`)
})

// connectSocketIO(server);
connectMongoDB()
