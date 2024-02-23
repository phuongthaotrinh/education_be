import 'dotenv/config'
import passport from 'passport'
import { Strategy as GoogleStrategy, VerifyFunctionWithRequest } from 'passport-google-oauth2'
import UserModel from '../models/user.model'

/**
 * @param options @interface StrategyOptionsWithRequest
 */
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			callbackURL: '/api/auth/google/callback',
			passReqToCallback: true
		},
		function (req, accessToken, refreshToken, profile, done) {
			UserModel.findOne({ email: profile.email }).exec((err, user) => {
				if (err) {
					return done(err, false)
				}
				if (!user) {
					return done(null, false)
				}

				const displayPicture = user?.picture || profile.picture
				return done(null, { ...user?.toObject(), picture: displayPicture })
			})
		} as VerifyFunctionWithRequest
	)
)

passport.serializeUser((user, done) => done(null, user))

passport.deserializeUser((user, done) => done(null, user!))
