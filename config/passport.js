import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

export default function configurePassport(app) {
  
   if (!app.locals?.models) {
    throw new Error('Models not initialized! Configure database first.');
  }

  const { User, Host } = app.locals.models;

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const hostEntry = await Host.findOne({ email });
      
      let user = await User.findOne({ 
        $or: [
          { googleId: profile.id },
          { email }
        ]
      });

      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email,
          role: hostEntry ? 'host' : 'student'
        });
      } else {
        // Update existing user if needed
        if (!user.googleId) user.googleId = profile.id;
        const newRole = hostEntry ? 'host' : 'student';
        if (user.role !== newRole) {
          user.role = newRole;
          await user.save();
        }
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}