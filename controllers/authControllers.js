import 'dotenv/config';
import passport from 'passport';

export const googleAuth = passport.authenticate('google', { 
  scope: ['profile', 'email'] 
});

// export const googleAuthCallback = (req, res, next) => {
//   passport.authenticate('google', async (err, user, info) => {
//     if (err || !user) {
//       return res.redirect(`${process.env.FRONTEND_URL}login`);
//     }

//     req.login(user, async (err) => {
//       if (err) return next(err);

//       const role = user.role;

//       if (role === 'host') {
//         return res.redirect(`${process.env.FRONTEND_URL}host-dashboard`);
//       }

//       try {
//         const Profile = req.models.Profile;
//         const profile = await Profile.findOne({ email: user.email });

//         if (profile) {
          
//           return res.redirect(`${process.env.FRONTEND_URL}user`);
//         } else {
          
//           return res.redirect(`${process.env.FRONTEND_URL}profile`);
//         }
//       } catch (dbErr) {
//         console.error("Profile check failed:", dbErr);
//         return res.redirect(`${process.env.FRONTEND_URL}error`);
//       }
//     });
//   })(req, res, next);
// };

export const logout = (req, res) => {
  req.logout(() => {
    res.redirect(process.env.FRONTEND_URL);
  });
};

export const googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL}login`);
    }

    req.login(user, async (err) => {
      if (err) return next(err);

      try {
        const Profile = req.models.Profile;
        const profile = await Profile.findOne({ email: user.email });

        // Save session before redirect
        req.session.save((err) => {
          if (err) return next(err);

          // Construct redirect URL with query describing user type
          const baseRedirect = `${process.env.FRONTEND_URL}oauth-success`;
          const params = new URLSearchParams();

          params.append('role', user.role);
          params.append('hasProfile', profile ? 'true' : 'false');

          // Redirect to oauth-success in frontend with these params
          return res.redirect(`${baseRedirect}?${params.toString()}`);
        });
      } catch (dbErr) {
        console.error("Profile check failed:", dbErr);
        return res.redirect(`${process.env.FRONTEND_URL}`);
      }
    });
  })(req, res, next);
};