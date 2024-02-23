// libraries
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import session, { MemoryStore } from 'express-session'
import helmet from 'helmet'
import morgan from 'morgan'
import passport from 'passport'
import './api/auth/googlePassport'
import './api/auth/localPassport'
// swagger
import swaggerUI from 'swagger-ui-express'
import swaggerOptions from './configs/swagger.config'
// routers
import path from 'path'
import rootRouter from './api/routes'
import AppConfig from './configs/app.config'
import { HttpStatusCode } from './configs/statusCode.config'

// Cronjobs
import './api/auto/cronjob.auto'

// resolve path
const ROOT_FOLDER = path.join(__dirname, '..')
const SRC_FOLDER = path.join(ROOT_FOLDER, 'src')

/* Initialize Express app */
const app = express()

/* Request body parser */
app.use(express.json())

/* Security request headers */
app.use(
	helmet({
		contentSecurityPolicy: {
			useDefaults: false,
			directives: {
				...helmet.contentSecurityPolicy.getDefaultDirectives(),
				'style-src': ["'self'", "'unsafe-inline'", AppConfig.BOOTSTRAP_ICONS_CDN],
				'script-src': ["'self'", "'unsafe-inline'", AppConfig.TAILWIND_CDN]
			}
		},
		referrerPolicy: {
			policy: 'strict-origin-when-cross-origin'
		}
	})
)

/* Logger */
app.use(morgan('tiny'))

/* Using Session - Cookies */
app.use(cookieParser())
app.use(
	session({
		saveUninitialized: false,
		secret: AppConfig.KEY_SESSION,
		store: new MemoryStore(),
		resave: true,
		cookie: {
			sameSite: 'none',
			path: '/'
		}
	})
)

/* Enabling CORS */
app.use(
	cors({
		origin: [process.env.LOCAL_FRONTEND_URL!, process.env.MAIN_FRONTEND_URL!],
		credentials: true,
		methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
		preflightContinue: true
	})
)

/* Init passport */
app.use(passport.initialize())
app.use(passport.session())

/* Enpoints */
app.use('/api', rootRouter)

/* Swagger */
// app.use('/public', express.static(path.join(SRC_FOLDER, 'public')));
app.use(
	'/api/document',
	swaggerUI.serve,
	swaggerUI.setup(swaggerOptions, { customCss: '.swagger-ui .topbar { display: none }' })
)
app.get('/', (req, res) => res.json({ message: 'Server now is running.', status: HttpStatusCode.OK }))

export default app
