import 'dotenv/config'

const isProduction = process.env.NODE_ENV?.includes('production')
const AppConfig = {
	PORT: process.env.PORT || 3001,
	KEY_SESSION: process.env.KEY_SESSION!,
	CLIENT_URL: isProduction ? process.env.MAIN_FRONTEND_URL! : process.env.LOCAL_FRONTEND_URL!,
	MONGO_URI: isProduction ? process.env.MAIN_DB_URI! : process.env.TEST_DB_URI!,
	TAILWIND_CDN: 'https://cdn.tailwindcss.com',
	BOOTSTRAP_ICONS_CDN: 'https://cdn.tailwindcss.com'
}

export default AppConfig
