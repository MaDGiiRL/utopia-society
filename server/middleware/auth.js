import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export function adminAuthMiddleware(req, res, next) {
  const token = req.cookies?.admin_token;

  if (!token) {
    return res.status(401).json({ message: "Non autenticato" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = {
      id: payload.sub,
      email: payload.email,
    };
    next();
  } catch (err) {
    console.error("JWT error", err);
    return res.status(401).json({ message: "Token non valido" });
  }
}
