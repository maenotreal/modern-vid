const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

function verifyToken(req, res, next) {
  // try to get the token from the Authorization header or cookies
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.split(' ')[1];
  const tokenFromCookie = req.cookies && req.cookies.token;
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    req.user = decoded;
    next();
  });
}

module.exports = verifyToken;
