const jwt = require('jsonwebtoken');

module.exports = {
    isLoggedIn: async function (req, res, next) {
        try {
            let token = req.cookies.token;
            console.log(req.cookies.token);
            if (!token) {
                return res.status(401).redirect('/unauthorized');
            } else {
                let ProfileData = await jwt.verify(token, process.env.SECRET_KEY);
                req.user = ProfileData;
                next();
            }
        } catch (error) {
            next(error);
        }
    }
}