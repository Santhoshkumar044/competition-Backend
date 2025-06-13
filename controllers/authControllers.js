import 'dotenv/config';
import passport from 'passport';

export const googleAuth = passport.authenticate('google', { 
  scope: ['profile', 'email'] 
});

export const googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL}login`);
    }

    req.login(user, (err) => {
      if (err) return next(err);

      // Redirect based on role
      const role = user.role; // assuming this is added in your `done()` method of Passport
      if (role === 'host') {
        return res.redirect(`${process.env.FRONTEND_URL}host-dashboard`);
      } else {
        return res.redirect(`${process.env.FRONTEND_URL}user`);
      }
    });
  })(req, res, next);
};

export const logout = (req, res) => {
  req.logout(() => {
    res.redirect(process.env.FRONTEND_URL);
  });
};