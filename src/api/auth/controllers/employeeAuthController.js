const Validator = require("validatorjs");
const { Employee } = require("../../../database/models");
const {
  comparePassword,
  hashPassword,
  generateTempPassword,
} = require("../../../utils/passwordUtil");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../../../utils/jwtUtil");
const { generateOTP, verifyUserName } = require("../../../utils/otpUtil");
const { generateFadaId } = require("../../../utils/fadaIdUtil");
const { addEmailJob, addSmsJob } = require("../../../queues");
const { Op } = require("sequelize");
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
      phone: "required|min:10|max:10|regex:/^[0-9]+$/",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { name, email, phone } = req.body;

    const existingEmployee = await Employee.findOne({
      where: { [Op.or]: [{ email }, { phone }] },
    });
    
    if (existingEmployee && existingEmployee.email === email) {
      return res.apiError("An employee with this email already exists", 409);
    }
    if (existingEmployee && existingEmployee.phone === phone) {
      return res.apiError("An employee with this phone already exists", 409);
    }

    const otp = generateOTP(6);
    const fadaId = await generateFadaId(Employee);
    const emailOTP = generateOTP(6);
    const employee = await Employee.create({
      fadaId,
      name,
      email,
      phone,
      otp,
      emailOTP,
      status: "temporary",
      isActive: false,
      isEmailVerified: false,
      isPhoneVerified: false,
    });

    await Promise.all([
      addEmailJob({
        to: email,
        subject: "Employee Registration OTP",
        templateName: "otp.ejs",
        data: {
          name,
          otp: emailOTP,
          purpose: "registration",
        },
      }),
      addSmsJob({
        to: phone,
        message: `Your Employee Registration OTP is ${otp}`,
        purpose: "registration",
      }),
    ]);

    return res.apiSuccess(
      "Employee registered successfully. Please verify OTP.",
      { fadaId: employee.fadaId, email: employee.email },
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/auth/verify-registration-otp
@Body: { email, emailOTP, phone, otp }
@Desc: Verify employee registration OTP
@Access: Public
*/
exports.verifyRegistrationOtp = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      email: "required|email",
      emailOTP: "required|string|min:6|max:6",
      phone: "required|min:10|max:10|regex:/^[0-9]+$/",
      otp: "required|string|min:6|max:6",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { email, emailOTP, phone, otp } = req.body;

    const employee = await Employee.findOne({
      where: { [Op.or]: [{ email }, { phone }] },
    });

    if (employee.email === email) {
      if (employee.emailOTP !== emailOTP) {
        return res.apiError("Invalid email OTP", 401);
      }
    }

    if (employee.phone === phone) {
      if (employee.otp !== otp) {
        return res.apiError("Invalid phone OTP", 401);
      }
    }

    const randomPassword = generateTempPassword(10);
    const hashedPassword = await hashPassword(randomPassword);

    await employee.update({
      otp: null,
      emailOTP: null,
      status: "pending",
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      password: hashedPassword, 
      isRegistrationCompleted: true,
    });

    await addEmailJob({
      to: email,
      subject: "Welcome to FADA-ID – Your Login Password",
      templateName: "employee-temp-password.ejs",
      data: {
        name: employee.name,
        password: randomPassword,
      },
    });

    return res.apiSuccess(
      "Registration OTP verified successfully. Please check your email for your login password.",
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

    const validator = new Validator(req.body, {
      email: "required|email",
      password: "required|string",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    
    const employee = await Employee.findOne({ where: { email } });
 
    if (!employee) {
      return res.apiError("Employee not found", 404);
    }

    if (employee.status === "rejected") {
      return res.apiError(
        "Your account has been rejected. Please contact to administrator to know more about your account status.",
        403,
      );
    }
 

    if (!employee.isActive && employee.status !== "temporary") {
      return res.apiError(
        "Your account is not active. Please contact to administrator.",
        403,
      );
    }

    const isPasswordValid = await comparePassword(password, employee.password);
    if (!isPasswordValid) {
      return res.apiError("Invalid email or password", 401);
    }

    const accessToken = generateAccessToken({
      id: employee.id,
      email: employee.email,
      phone: employee.phone,
      role: "employee",
    });

    const refreshToken = generateRefreshToken({
      id: employee.id,
      email: employee.email,
      phone: employee.phone,
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
        fadaId: employee.fadaId,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        status: employee.status,
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
      phone: employee.phone,
      role: "employee",
    });

    const newRefreshToken = generateRefreshToken({
      id: employee.id,
      email: employee.email,
      phone: employee.phone,
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
@API: POST /employee/auth/send-login-otp
@Body: { username }
@Desc: Send OTP for employee login via email or phone
@Access: Public
*/
exports.sendLoginOtp = async (req, res) => {
  try {
    const { username } = req.body;

    const validator = new Validator(req.body, {
      username: "required",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const usernameFilter = verifyUserName(username);
    if (usernameFilter.error) {
      return res.apiError("Invalid email or phone", 422);
    }

    const whereClause = usernameFilter.email ? { email: usernameFilter.email } : { phone: usernameFilter.phone };

    const employee = await Employee.findOne({
      where: whereClause,
    });

    if (!employee) {
      return res.apiError("user not found", 404);
    }

     

    if (employee.status === "rejected") {
      return res.apiError("Your account has been rejected", 403);
    }

    if (!employee.isActive && employee.status !== "temporary") {
      return res.apiError("Your account is not active. Please contact to administrator.", 403);
    }

    const otp = generateOTP(6);

    const data = usernameFilter.email ? { emailOTP: otp } : { otp:otp };
     
    await employee.update(data);

    if (usernameFilter.email) {
       await addEmailJob({
        to: employee.email,
        subject: "FADA-ID Login OTP",
        templateName: "otp.ejs",
        data: {
          name: employee.name,
          otp,
          purpose: "login",
        },
      });
    }else if (usernameFilter.phone) {
      await addSmsJob({
        to: employee.phone,
        message: `Your Employee Login OTP is ${otp}`,
        purpose: "login",
      });
    }

    return res.apiSuccess("OTP sent successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/auth/verify-login-otp
@Body: { username, otp }
@Desc: Verify OTP and login employee via email or phone
@Access: Public
*/
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { username, otp } = req.body;

    const validator = new Validator(req.body, {
      username: "required",
      otp: "required|string|min:6|max:6",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const usernameFilter = verifyUserName(username);
    if (usernameFilter.error) {
      return res.apiError("Invalid email or phone", 422);
    }

    const isEmail = usernameFilter.email ? true : false;

    const employee = await Employee.findOne({
      where: usernameFilter,
    });

    if (!employee) {
      return res.apiError("Employee not found", 404);
    }
 
    if (employee.status === "rejected") {
      return res.apiError("Your account has been rejected. Please contact to administrator.", 403);
    }

    if (isEmail ?!employee.emailOTP : !employee.otp) {
      return res.apiError("No OTP found. Please request a new OTP", 400);
    }

    if (String(isEmail ? employee.emailOTP : employee.otp) !== String(otp)) {
      return res.apiError("Invalid OTP", 401);
    }

    const accessToken = generateAccessToken({
      id: employee.id,
      email: employee.email,
      phone: employee.phone,
      role: "employee",
    });

    const refreshToken = generateRefreshToken({
      id: employee.id,
      email: employee.email,
      phone: employee.phone,
      role: "employee",
    });

    await employee.update({
      otp: null,
      emailOTP: null,
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
      fadaId: employee.fadaId,
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

/*
@API: POST /employee/auth/forgot-password
@Body: { username }
@Desc: Forgot employee password
@Access: Public
*/
exports.forgotPassword = async (req, res) => {
  try {
      const { username } = req.body;

    const validator = new Validator(req.body, {
      username: "required",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const usernameFilter = verifyUserName(username);
    if (usernameFilter.error) {
      return res.apiError("Invalid email or phone", 422);
    }

    const employee = await Employee.findOne({ where: usernameFilter });
    if (!employee) {
      return res.apiError("Employee not found", 404);
    }

    if (employee.status === "rejected") {
      return res.apiError("Your account has been rejected. Please contact to administrator.", 403);
    }

    if (!employee.isActive && employee.status !== "temporary") {
      return res.apiError("Your account is not active. Please contact to administrator.", 403);
    }

    const otp = generateOTP(6);

    const data = usernameFilter.email ? { emailOTP: otp } : { otp:otp };
     
    await employee.update(data);
    
    if (usernameFilter.email) {
      await addEmailJob({
        to: employee.email,
        subject: "FADA-ID Forgot Password OTP",
        templateName: "otp.ejs",
        data: {
          name: employee.name,
          otp,
          purpose: "OTP",
        },
      });
    }else if (usernameFilter.phone) {
      await addSmsJob({
        to: employee.phone,
        message: `Your FADA-ID OTP is ${otp}`,
        purpose: "OTP",
      });
    }

    return res.apiSuccess("OTP sent successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/auth/verify-forgot-password-otp
@Body: { username, otp }
@Desc: Verify forgot password OTP
@Access: Public
*/
exports.verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { username, otp } = req.body;

    const validator = new Validator(req.body, {
      username: "required",
      otp: "required|string|min:6|max:6",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const usernameFilter = verifyUserName(username);
    if (usernameFilter.error) {
      return res.apiError("Invalid email or phone", 422);
    }

    const isEmail = usernameFilter.email ? true : false;

    const employee = await Employee.findOne({ where: usernameFilter });
    if (!employee) {
      return res.apiError("Employee not found", 404);
    }

    if (employee.status === "rejected") {
      return res.apiError("Your account has been rejected. Please contact to administrator.", 403);
    }

    if (!employee.isActive && employee.status !== "temporary") {
      return res.apiError("Your account is not active. Please contact to administrator.", 403);
    }

    if (isEmail ? employee.emailOTP !== otp : employee.otp !== otp) {
      return res.apiError("Invalid OTP", 401);
    }

    const resetPasswordToken = generateAccessToken({id: employee.id}, "15m");

    await employee.update({
      otp: null,
      emailOTP: null,
    });

    return res.apiSuccess("OTP verified successfully",{resetPasswordToken});
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/auth/reset-password
@Body: {  password, confirmPassword }
@Desc: Reset employee password
@Access: Public
*/
exports.resetPassword = async (req, res) => {
  try {
     
    const validator = new Validator(req.body, {
      password: "required|string",
      confirmPassword: "required|string|same:password",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { password, confirmPassword } = req.body;

    const id = req.auth.id;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.apiError("Employee not found", 404);
    }

    const hashedPassword = await hashPassword(password);

    await employee.update({
      password: hashedPassword,
    });

    return res.apiSuccess("Password reset successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};





  