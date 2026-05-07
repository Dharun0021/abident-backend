const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.header("Authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_super_secret_jwt_key_12345"
    );
    req.user = decoded;
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

const doctorAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user?.role !== "DOCTOR") {
      return res
        .status(403)
        .json({ message: "Doctor role required to access this route" });
    }

    return next();
  });
};

module.exports = { auth, doctorAuth };
