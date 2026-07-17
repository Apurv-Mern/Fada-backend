const bcrypt = require("bcrypt");
const Validator = require("validatorjs");
const { User, LoginAttempt } = require("../../../database/models");
const { generateToken } = require("../../../utils/jwtUtil");

const login = async (req, res) => {
  try {
    // Validate inputs
    const validation = new Validator(req.body, {
      email: "required|email",
      password: "required|string|min:6",
    });

    if (validation.fails()) {
      return res.apiError(
        Object.values(validation.errors.all()).flat()[0],
        422
      );
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      await logAttempt({
        email,
        req,
        success: false,
        message: "User not found",
      });
      return res.apiError("Invalid email or password", 401);
    }

    // Check account status
    if (!user.isActive) {
      return res.apiError("Your account is inactive or blocked", 403);
    }

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      await logAttempt({
        email,
        req,
        success: false,
        message: "Invalid password",
      });
      return res.apiError("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Return success response
    return res.apiSuccess("Login successful", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

const logAttempt = async ({ email, req, success, message }) => {
  await LoginAttempt.create({
    email,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    success,
    message,
  });
};

module.exports = {
  login,
};
