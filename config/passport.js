import 'dotenv/config';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/users.js';
import Host from '../models/hostschema.js'; 

const configurePassport = () => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;

      //Check if email is listed as a host
      const hostEntry = await Host.findOne({ email });

      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: email,
          role: hostEntry ? 'host' : 'student' //Assign role based on host DB
        });
        await user.save();
      } else {
        //If user already exists and host status changed
        const newRole = hostEntry ? 'host' : 'student';
        if (user.role !== newRole) {
          user.role = newRole;
          await user.save();
        }
      }

      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));

  passport.serializeUser((user, done) => done(null, user._id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

export default configurePassport;
