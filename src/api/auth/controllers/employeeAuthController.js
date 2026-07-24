const Validator = require("validatorjs");
const { Employee } = require("../../../database/models");
const { comparePassword } = require("../../../utils/passwordUtil");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../../../utils/jwtUtil");
const { generateOTP, verifyUserName } = require("../../../utils/otpUtil");
const { generateFadaId } = require("../../../utils/fadaIdUtil");
const { sendOtpEmail } = require("../../../utils/emailUtil");

/*
@API: POST /employee/auth/register
@Body: { name, email, dob, gender }
@Desc: Employee Registration
@Access: Public
*/
exports.employeeRegister = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      name: "required|string",
      email: "required|email",
      dob: "required|date",
      gender: "required|string|in:male,female,other",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { name, email, dob, gender } = req.body;

    const existingEmployee = await Employee.findOne({ where: { email } });
    if (existingEmployee) {
      return res.apiError("An employee with this email already exists", 409);
    }

    const otp = generateOTP(6);
    const fadaId = await generateFadaId(Employee);

    const employee = await Employee.create({
      fadaId,
      name,
      email,
      dob,
      gender,
      otp,
      status: "temporary",
      isActive: false,
      isEmailVerified: false,
    });

    try {
      await sendOtpEmail(email, { name, otp, purpose: "registration" });
    } catch (emailError) {
      console.error("Failed to send registration OTP email:", emailError.message);
    }

    return res.apiSuccess(
      "Employee registered successfully. Please verify OTP.",
      { fadaId: employee.fadaId, email: employee.email }
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/auth/verify-otp
@Body: { email, otp }
@Desc: Verify employee registration OTP
@Access: Public
*/
exports.verifyOtp = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      email: "required|email",
      otp: "required|string|min:4|max:8",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { email, otp } = req.body;

    const employee = await Employee.findOne({ where: { email } });
    if (!employee) {
      return res.apiError("Employee not found", 404);
    }

    if (employee.status !== "temporary") {
      return res.apiError(
        "OTP verification is not required for this account",
        400
      );
    }

    if (!employee.otp) {
      return res.apiError(
        "No OTP found. Please register again or request a new OTP",
        400
      );
    }

    if (String(employee.otp) !== String(otp)) {
      return res.apiError("Invalid OTP", 401);
    }

    await employee.update({
      otp: null,
      status: "pending",
      isEmailVerified: true,
    });

    const accessToken = generateAccessToken({
      id: employee.id,
      email: employee.email,
      role: "employee",
    });

    const refreshToken = generateRefreshToken({
      id: employee.id,
      email: employee.email,
      role: "employee",
    });

    await employee.update({ refreshToken });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.apiSuccess(
      "OTP verified successfully. Please create your profile.",
      { accessToken }
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/auth/login
@Body: { email, password }
@Desc: Employee Login
@Access: Public
*/
exports.employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.apiError("Provide either email or phone", 422);
    }

    if (!password) {
      return res.apiError("Password is required", 422);
    }

    const usernameFilter = verifyUserName(email);
    if (usernameFilter.error) {
      return res.apiError("Invalid email or phone", 422);
    }

    const employee = await Employee.findOne({
      where: usernameFilter,
    });

    if (!employee) {
      return res.apiError("Employee not found", 404);
    }

    if (employee.status === "rejected") {
      return res.apiError(
        "Your account has been rejected. Please contact support",
        403
      );
    }

    if (!employee.password) {
      return res.apiError(
        "Your password is not set. Please set your password to login",
        404
      );
    }

    if (!employee.isActive && employee.status !== "temporary") {
      return res.apiError(
        "Your account is not active. Please activate your account to login",
        403
      );
    }

    const isPasswordValid = await comparePassword(password, employee.password);
    if (!isPasswordValid) {
      return res.apiError("Invalid password", 401);
    }

    const accessToken = generateAccessToken({
      id: employee.id,
      email: employee.email,
      role: "employee",
    });

    const refreshToken = generateRefreshToken({
      id: employee.id,
      email: employee.email,
      role: "employee",
    });

    await employee.update({ refreshToken });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: "employee",
      },
    });
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/auth/refresh-token
@Body: {}
@Desc: Refresh Employee Access Token
@Access: Public (Requires Refresh Token in Cookie)
*/
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.apiError("Refresh token not provided", 401);
    }

    const payload = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);

    const employee = await Employee.findByPk(payload.id);

    if (!employee || employee.refreshToken !== refreshToken) {
      return res.apiError("Invalid refresh token", 403);
    }

    const accessToken = generateAccessToken({
      id: employee.id,
      email: employee.email,
      role: "employee",
    });

    const newRefreshToken = generateRefreshToken({
      id: employee.id,
      email: employee.email,
      role: "employee",
    });

    await employee.update({ refreshToken: newRefreshToken });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.apiSuccess("Token refreshed successfully", { accessToken });
  } catch (error) {
    return res.apiError("Invalid or expired refresh token", 401, error);
  }
};

/*
@API: POST /employee/auth/logout
@Body: {}
@Desc: Employee Logout
@Access: Public (Requires Refresh Token in Cookie)
*/
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const employee = await Employee.findOne({
        where: { refreshToken },
      });

      if (employee) {
        await employee.update({ refreshToken: null });
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    return res.apiSuccess("Logged out successfully", null, {
      authenticated: false,
    });
  } catch (error) {
    return res.apiError("Logout failed", 500, error);
  }
};

/*
@API: POST /employee/auth/login-otp
@Body: { email }
@Desc: Send OTP for employee login via email or phone
@Access: Public
*/
exports.loginWithOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.apiError("Email or phone is required", 422);
    }

    const usernameFilter = verifyUserName(email);
    if (usernameFilter.error) {
      return res.apiError("Invalid email or phone", 422);
    }

    const employee = await Employee.findOne({
      where: usernameFilter,
    });

    if (!employee) {
      return res.apiError("Employee not found", 404);
    }

    if (employee.status === "temporary") {
      return res.apiError(
        "Please complete registration OTP verification first",
        403
      );
    }

    if (employee.status === "rejected") {
      return res.apiError("Your account has been rejected", 403);
    }

    if (employee.isActive === false && employee.status !== "pending") {
      return res.apiError("Your account is inactive", 403);
    }

    const otp = generateOTP(6);
    await employee.update({ otp });

    if (usernameFilter.email) {
      try {
        await sendOtpEmail(usernameFilter.email, {
          name: employee.name,
          otp,
          purpose: "login",
        });
      } catch (emailError) {
        console.error("Failed to send login OTP email:", emailError.message);
      }
    }

    return res.apiSuccess("OTP sent successfully", usernameFilter);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/auth/login-otp/verify
@Body: { email, otp }
@Desc: Verify OTP and login employee via email or phone
@Access: Public
*/
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email) {
      return res.apiError("Email or phone is required", 422);
    }

    if (!otp || String(otp).length !== 6) {
      return res.apiError("Invalid OTP", 422);
    }

    const usernameFilter = verifyUserName(email);
    if (usernameFilter.error) {
      return res.apiError("Invalid email or phone", 422);
    }

    const employee = await Employee.findOne({
      where: usernameFilter,
    });

    if (!employee) {
      return res.apiError("Employee not found", 404);
    }

    if (employee.status === "temporary") {
      return res.apiError(
        "Please complete registration OTP verification first",
        403
      );
    }

    if (employee.status === "rejected") {
      return res.apiError("Your account has been rejected", 403);
    }

    if (!employee.otp) {
      return res.apiError("No OTP found. Please request a new OTP", 400);
    }

    if (String(employee.otp) !== String(otp)) {
      return res.apiError("Invalid OTP", 401);
    }

    const accessToken = generateAccessToken({
      id: employee.id,
      email: employee.email,
      role: "employee",
    });

    const refreshToken = generateRefreshToken({
      id: employee.id,
      email: employee.email,
      role: "employee",
    });

    await employee.update({
      otp: null,
      refreshToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.apiSuccess("Login successful", {
      accessToken,
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      status: employee.status,
      role: "employee",
    });
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};
