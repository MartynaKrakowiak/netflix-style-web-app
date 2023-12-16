const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    //Split the Authorization header to remove 'Bearer' prefix, if present
    const token = req.headers['authorization'].split(" ")[1];
    //console.log(token)
    if (!token) {
        return res.status(403).json({
            message: 'No token provided'
        });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: 'Failed to authenticate token'
            });
        }
        //If verification is successful, save the decoded user information for later use
        req.user = decoded;
        //Continue to the next middleware or route handler
        next();
    });
}

module.exports = verifyToken