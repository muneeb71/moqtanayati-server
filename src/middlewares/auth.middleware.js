const { verifyToken } = require("../utils/jwt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid token.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      console.error("Auth: token verification failed");
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    // Fetch latest user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        accountStatus: true,
        email: true,
        name: true,
      },
    });

    if (!user || user.accountStatus === "DISABLED") {
      console.error("Auth: user invalid or disabled", { decoded, user });
      return res.status(403).json({
        success: false,
        message: "Your profile has been disabled. Action not allowed.",
      });
    }

    req.user = {
      ...decoded,
      role: user.role,
      email: user.email,
      name: user.name,
    };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

const sellerAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid token.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    if (decoded.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Seller privileges required.",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

module.exports = {
  authMiddleware,
  sellerAuthMiddleware,
};
