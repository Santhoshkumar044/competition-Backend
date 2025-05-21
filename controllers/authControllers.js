import 'dotenv/config';
import passport from 'passport';

export const googleAuth = passport.authenticate('google', { 
  scope: ['profile', 'email'] 
});

export const googleAuthCallback = passport.authenticate('google', {
  failureRedirect: `${process.env.FRONTEND_URL}/login`,
  successRedirect: `${process.env.FRONTEND_URL}/dashboard`
});

export const logout = (req, res) => {
  req.logout(() => {
    res.redirect(process.env.FRONTEND_URL);
  });
};