import jwt from "jsonwebtoken";
import User from "../models/user.js";
const authMiddleware = async (req, res, next) => {
  const token =
    req.headers["x-access-token"] ||
    (req.headers.authorization && req.headers.authorization.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null);
  if (!token)
    return res
      .status(403)
      .json({ error: true, message: "Access Denied: No token provided" });
  try {
    const tokenDetails = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_PRIVATE_KEY
    );
    const currentUser = await User.findById(tokenDetails._id);
    if (!currentUser)
      return res.status(401).json({
        error: true,
        message: "The user belonging to this token does no longer exist.",
      });
    req.user = currentUser;
    next();
  } catch (err) {
    // console.log(err);
    res
      .status(401)
      .json({ error: true, message: "Access Denied: Invalid token" });
  }
};
export default authMiddleware;
