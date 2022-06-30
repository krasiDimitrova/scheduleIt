const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const tokenHeader = req.headers["authorization"];
  const segments = tokenHeader?.split(" ");
  if (
    !segments ||
    segments.length !== 2 ||
    segments[0].trim() !== "Bearer" ||
    segments[1].trim().length < 80
  ) {
    next({ status: 401, message: `No access token provided.` });
    return;
  }
  const token = segments[1].trim();

  jwt.verify(
    token,
    process.env.SCHEDULEIT_API_SECRET,
    function (error, decoded) {
      if (error)
        next({ status: 401, message: `Failed to authenticate token.`, error });
      else {
        req.userId = decoded.id;
        next();
      }
    }
  );
}

module.exports = verifyToken;
