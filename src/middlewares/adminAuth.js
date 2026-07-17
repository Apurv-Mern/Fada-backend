const jwt = require("jsonwebtoken");

const { Admin } = require("../database/models");
const constants = require("../config/config");

module.exports = async function (req, res, next) {
  try {
    // Get the token from the request headers
    const tokenString = req.headers["authorization"];

    if (!tokenString) {
      return res.authError("Authentication failed: No token provided.", 401);
    }

    if (!tokenString.startsWith("Bearer")) {
      return res.authError("Authentication failed: Invalid token", 401);
    }

    const tokenSplit = tokenString.split(" ");
    if (tokenSplit.length !== 2) {
      return res.authError("Authentication failed: Invalid token", 401);
    }

    // Verify the token using jwt.verify method
    const decodedToken = jwt.verify(tokenSplit[1], constants.jwt.secret);
    let userData = await Admin.findOne({ where: { id: decodedToken.id } });

    if (userData === null) {
      return res.authError("Authentication failed: Token has expired", 401);
    }

    //Check restricted user login on multiple devices
    /* if(userData.deviceToken !== decodedToken.deviceToken){
            res.apiError("Authentication failed: Token has expired",401);  
        } */

    req.auth = userData;

    next();
  } catch (error) {
    return res.apiError("Internal server error.", 500, error);
    // next(error)
  }
};
