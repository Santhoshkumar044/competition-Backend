const isHost = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized: Please log in' });
  }

  if (req.user.role === 'host') {
    return next(); //User is a host, proceed
  }

  return res.status(403).json({ message: 'Access denied: Hosts only' });
};

export default isHost;
