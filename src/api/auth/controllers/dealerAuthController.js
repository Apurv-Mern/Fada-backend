const Validator = require("validatorjs");
const { Dealer } = require("../../../database/models");
const {
  comparePassword,
  hashPassword,
  generateTempPassword,
} = require("../../../utils/passwordUtil");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} = require("../../../utils/jwtUtil");
const { generateOTP, verifyUserName } = require("../../../utils/otpUtil");
const { generateDealerId } = require("../../../utils/fadaIdUtil");
const { addEmailJob, addSmsJob } = require("../../../queues");
/*
@API: POST /dealer/auth/register
@Body: { name, dealerCode, email, password, phone }
@Desc: Dealer Registration
@Access: Public
*/
exports.dealerRegister = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      name: "required|string",
      dealerCode: "required|string",
      email: "required|email",
      password: "required|string|min:6",
      phone: "required|string",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { name, dealerCode, email, password, phone } = req.body;

    // Prevent duplicate registrations
    const existingDealer = await Dealer.findOne({ where: { email } });
    if (existingDealer) {
      return res.apiError("A dealer with this email already exists", 409);
    }

    const existingDealerCode = await Dealer.findOne({ where: { dealerCode } });
    if (existingDealerCode) {
      return res.apiError("A dealer with this dealer code already exists", 409);
    }

    const hashedPassword = await hashPassword(password);

    // Generate OTP
    const otp = generateOTP(4);

    await addEmailJob({
      to: email,
      subject: "Dealer Registration OTP",
      templateName: "otp.ejs",
      data: {
        name,
        otp,
        purpose: "registration",
      },
    });

    await Dealer.create({
      name,
      dealerCode,
      dealerId: await generateDealerId(Dealer),
      email,
      password: hashedPassword,
      otp,
      phone,
      status: "temporary",
      isActive: false,
      isEmailVerified: false,
    });

    return res.apiSuccess("Dealer registered successfully. Please verify OTP.");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /dealer/auth/verify-otp
@Body: { email, otp }
@Desc: Verify dealer registration OTP
@Access: Public
*/
exports.verifyOtp = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      email: "required|email",
      otp: "required|string|min:4|max:4",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { email, otp } = req.body;

    const dealer = await Dealer.findOne({ where: { email } });
    if (!dealer) {
      return res.apiError("Dealer not found", 404);
    }

    if (dealer.status !== "temporary") {
      return res.apiError(
        "OTP verification is not required for this account",
        400,
      );
    }

    if (!dealer.otp) {
      return res.apiError(
        "No OTP found. Please register again or request a new OTP",
        400,
      );
    }

    const isStoredOtpValid = String(dealer.otp) === String(otp);

    if (!isStoredOtpValid) {
      return res.apiError("Invalid OTP", 401);
    }

    await dealer.update({
      otp: null,
      status: "pending",
      isEmailVerified: true,
      isActive: true,
    });

    const accessToken = generateAccessToken({
      id: dealer.id,
      email: dealer.email,
      role: "dealer",
    });

    const refreshToken = generateRefreshToken({
      id: dealer.id,
      email: dealer.email,
      role: "dealer",
    });

    await dealer.update({
      refreshToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. Please create your profile.",
      accessToken,
      dealer: {
        id: dealer.id,
        dealerCode: dealer.dealerCode,
        name: dealer.name,
        email: dealer.email,
        phone: dealer.phone,
        role: "dealer",
        status: dealer.status,
        isEmailVerified: dealer.isEmailVerified,
        isGroupHoldingEntity: dealer.isGroupHoldingEntity,
        isActive: dealer.isActive,
        createdAt: dealer.createdAt,
        updatedAt: dealer.updatedAt,
      },
    });
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /dealer/auth/login
@Body: { email?, password }
@Desc: Dealer Login
@Access: Public     
*/
exports.dealerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.apiError("Provide either email or phone", 422);
    }

    if (!password) {
      return res.apiError("Password is required", 422);
    }

    const dealer = await Dealer.findOne({
      where: verifyUserName(email),
    });

    if (!dealer) {
      return res.apiError("Dealer not found ", 404);
    }

    if (dealer.status === "rejected") {
      return res.apiError(
        "Your account has been rejected. Please contact support",
        403,
      );
    }



    if (dealer && !dealer.password) {
      return res.apiError(
        "Your password is not set. Please set your password to login",
        404,
      );
    }

    /* if (!dealer.isActive && dealer.status !== "temporary") {
            return res.apiError(
                "Your account is not active. Please activate your account to login",
                403,
            );
        } */

    // if email is not verified, send OTP
    if (!dealer.isEmailVerified) {
      const otp = generateOTP(4);
      await dealer.update({ otp });
      await addEmailJob({
        to: dealer.email,
        subject: "Dealer Login OTP",
        templateName: "otp.ejs",
        data: {
          name: dealer.name,
          otp: otp,
          purpose: "login",
        },
      });

      return res.apiSuccess(
        "OTP sent successfully. Please verify your email to login",
        {
          email: dealer.email,
          isEmailVerified: false,
          isActive: false,
        },
      );
    }


    const isPasswordValid = await comparePassword(password, dealer.password);
    if (!isPasswordValid) {
      return res.apiError("Invalid password", 401);
    }

    // Generate Tokens
    const accessToken = generateAccessToken({
      id: dealer.id,
      email: dealer.email,
      role: "dealer",
    });

    const refreshToken = generateRefreshToken({
      id: dealer.id,
      email: dealer.email,
      role: "dealer",
    });

    // Save refresh token in DB (Recommended)
    await dealer.update({
      refreshToken,
    });

    // Send Refresh Token in HttpOnly Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      dealer: {
        id: dealer.id,
        dealerCode: dealer.dealerCode,
        name: dealer.name,
        email: dealer.email,
        phone: dealer.phone,
        role: "dealer",
        status: dealer.status,
        isEmailVerified: dealer.isEmailVerified,
        isActive: dealer.isActive,
        mustChangePassword: dealer.mustChangePassword,
        isGroupHoldingEntity: dealer.isGroupHoldingEntity,
        createdAt: dealer.createdAt,
        updatedAt: dealer.updatedAt,
      },
    });
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /dealer/auth/refresh-token
@Body: {}
@Desc: Refresh Dealer Access Token
@Access: Public (Requires Refresh Token in Cookie)
*/
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.apiError("Refresh token not provided", 401);
    }

    const payload = verifyRefreshToken(refreshToken);

    const dealer = await Dealer.findByPk(payload.id);

    if (!dealer || dealer.refreshToken !== refreshToken) {
      return res.apiError("Invalid refresh token", 403);
    }

    const accessToken = generateAccessToken({
      id: dealer.id,
      email: dealer.email,
      role: "dealer",
    });

    const newRefreshToken = generateRefreshToken({
      id: dealer.id,
      email: dealer.email,
      role: "dealer",
    });

    await dealer.update({
      refreshToken: newRefreshToken,
    });

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
@API: POST /dealer/auth/logout
@Body: {}
@Desc: Dealer Logout
@Access: Public (Requires Refresh Token in Cookie)
*/
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const dealer = await Dealer.findOne({
        where: { refreshToken },
      });

      if (dealer) {
        await dealer.update({
          refreshToken: null,
        });
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
@API: POST /dealer/auth/change-password
@Body: { currentPassword, newPassword, confirmPassword }
@Desc: Change dealer password
@Access: Private
*/
exports.changePassword = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      currentPassword: "required|string",
      newPassword: "required|string|min:6",
      confirmPassword: "required|string|same:newPassword",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { currentPassword, newPassword } = req.body;
    const dealer = await Dealer.findByPk(req.auth.id);

    if (!dealer) {
      return res.apiError("Dealer not found", 404);
    }

    if (!dealer.password) {
      return res.apiError(
        "Password is not set. Please set your password first",
        400,
      );
    }

    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      dealer.password,
    );

    if (!isCurrentPasswordValid) {
      return res.apiError("Current password is incorrect", 401);
    }

    const isSamePassword = await comparePassword(newPassword, dealer.password);
    if (isSamePassword) {
      return res.apiError(
        "New password must be different from current password",
        422,
      );
    }

    await dealer.update({
      password: await hashPassword(newPassword),
      mustChangePassword: false,
    });

    return res.apiSuccess("Password changed successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /dealer/auth/forgot-password
@Body: { email }
@Desc: Send OTP to dealer email for password reset
@Access: Public
*/
exports.forgotPassword = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      email: "required|email",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { email } = req.body;
    const dealer = await Dealer.findOne({ where: { email } });

    /*  if (
       dealer &&
       dealer.isActive !== false &&
       dealer.status !== "rejected" &&
       dealer.status !== "temporary"
     ) { */

    const otp = generateOTP(4);

    await dealer.update({
      refreshToken: null,
      otp: otp,
    });

    await addEmailJob({
      to: dealer.email,
      subject: "FADA-ID Dealer OTP",
      templateName: "otp.ejs",
      data: {
        name: dealer.name || "Dealer",
        otp: otp,
        purpose: "forgot-password",
      },
    });
    /*  } */

    return res.apiSuccess(
      "If an account exists with this email, an OTP has been sent to your email",
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /dealer/auth/forgot-password/verify-otp
@Body: { email, otp }
@Desc: Verify forgot password OTP only (does not login or reset password)
@Access: Public
*/
exports.verifyForgotPasswordOtp = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      email: "required|email",
      otp: "required|string|size:4",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { email, otp } = req.body;

    const dealer = await Dealer.findOne({ where: { email } });

    if (!dealer) {
      return res.apiError("Invalid OTP", 401);
    }

    /* if (dealer.isActive === false) {
      return res.apiError("Account is inactive. Please contact support", 403);
    } */

    if (dealer.status === "rejected" || dealer.status === "temporary") {
      return res.apiError(dealer.status === "rejected" ? "Your account has been rejected" : "Your account is not verified", 401);
    }

    if (!dealer.otp) {
      return res.apiError("No OTP found. Please request a new OTP", 400);
    }

    if (String(dealer.otp) !== String(otp)) {
      return res.apiError("Invalid OTP", 401);
    }

    const resetToken = generateAccessToken(
      {
        id: dealer.id,
        email: dealer.email,
        role: "dealer",
        purpose: "password-reset",
      },
      "15m",
    );

    await dealer.update({ otp: null });

    return res.apiSuccess("OTP verified successfully", null, { resetToken });
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /dealer/auth/forgot-password/reset
@Body: { resetToken, newPassword, confirmPassword }
@Desc: Reset dealer password using reset token from OTP verification
@Access: Public
*/
exports.resetPassword = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      resetToken: "required|string",
      newPassword: "required|string|min:6",
      confirmPassword: "required|string|same:newPassword",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { resetToken, newPassword } = req.body;

    let payload;
    try {
      payload = verifyAccessToken(resetToken);
    } catch {
      return res.apiError("Invalid or expired reset token", 401);
    }

    if (
      payload.role !== "dealer" ||
      payload.purpose !== "password-reset" ||
      !payload.id
    ) {
      return res.apiError("Invalid or expired reset token", 401);
    }

    const dealer = await Dealer.findByPk(payload.id);

    if (!dealer) {
      return res.apiError("Dealer not found", 404);
    }

    /* if (
      dealer.isActive === false ||
      dealer.status === "rejected" ||
      dealer.status === "temporary"
    ) {
      return res.apiError("Account is not eligible for password reset", 403);
    } */

    if (dealer.email !== payload.email) {
      return res.apiError("Invalid or expired reset token", 401);
    }

    if (dealer.password) {
      const isSamePassword = await comparePassword(newPassword, dealer.password);
      if (isSamePassword) {
        return res.apiError(
          "New password must be different from current password",
          422,
        );
      }
    }

    await dealer.update({
      password: await hashPassword(newPassword),
      mustChangePassword: false,
      refreshToken: null,
      otp: null,
    });

    return res.apiSuccess("Password reset successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /dealer/auth/login-otp
@Body: { email? } OR { phone? }
@Desc: Send OTP for dealer login via email or phone
@Access: Public
*/
exports.loginWithOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.apiError("Email or phone is required", 422);
    }

    const dealer = await Dealer.findOne({
      where: verifyUserName(email),
    });

    if (!dealer) {
      return res.apiError("Dealer not found", 404);
    }

    /*  if (dealer.status === "temporary") {
            return res.apiError(
                "Please complete registration OTP verification first",
                403,
            );
        } */

    if (dealer.status === "rejected") {
      return res.apiError("Your account has been rejected", 403);
    }

    /* if (dealer.isActive === false && dealer.status !== "pending") {
            return res.apiError("Your account is inactive", 403);
        } */

    const otp = generateOTP(4);

    await dealer.update({ otp });

    const usernameFilter = verifyUserName(email);
    if (usernameFilter.email) {
      await addEmailJob({
        to: email,
        subject: "Dealer Login OTP",
        templateName: "otp.ejs",
        data: {
          name: dealer.name,
          otp,
          purpose: "login",
        },
      });
    } else if (usernameFilter.phone) {
      await addSmsJob({
        phone: usernameFilter.phone,
        otp: otp,
        purpose: "OTP",
      });
    }

    return res.apiSuccess("OTP sent successfully", verifyUserName(email));
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /dealer/auth/login-otp/verify
@Body: { email?,  otp }
@Desc: Verify OTP and login dealer via email or phone
@Access: Public
*/
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email) {
      return res.apiError("Email or phone is required", 422);
    }

    if (otp.length !== 4) {
      return res.apiError("Invalid OTP", 422);
    }

    const dealer = await Dealer.findOne({
      where: verifyUserName(email),
    });

    if (!dealer) {
      return res.apiError("User not found", 404);
    }

    if (dealer.status === "rejected") {
      return res.apiError("Your account has been rejected", 403);
    }

    if (!dealer.otp) {
      return res.apiError("No OTP found. Please request a new OTP", 400);
    }

    if (String(dealer.otp) !== String(otp)) {
      return res.apiError("Invalid OTP", 401);
    }

    const accessToken = generateAccessToken({
      id: dealer.id,
      email: dealer.email,
      role: "dealer",
    });

    const refreshToken = generateRefreshToken({
      id: dealer.id,
      email: dealer.email,
      role: "dealer",
    });

    let dealerData = {
      otp: null,
      refreshToken,
    };

    /* if (dealer.status === "temporary") {  
    dealerData.status = "pending";
    dealerData.isEmailVerified = true;
    dealerData.isActive = true;
       } */

    await dealer.update(dealerData);

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
      dealer: {
        id: dealer.id,
        dealerCode: dealer.dealerCode,
        name: dealer.name,
        email: dealer.email,
        phone: dealer.phone,
        role: "dealer",
        status: dealer.status,
        isEmailVerified: dealer.isEmailVerified,
        isGroupHoldingEntity: dealer.isGroupHoldingEntity,
        isActive: dealer.isActive,
        createdAt: dealer.createdAt,
        updatedAt: dealer.updatedAt,
      },
    });
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};
