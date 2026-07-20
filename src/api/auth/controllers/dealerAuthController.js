const Validator = require("validatorjs");
const { Dealer } = require("../../../database/models");
const { comparePassword } = require("../../../utils/passwordUtil");
const { generateAccessToken, generateRefreshToken } = require("../../../utils/jwtUtil");
const { generateOTP } = require("../../../utils/otpUtil");
const config = require("../../../config/config");


/*
@API: POST /dealer/auth/register
@Body: { name, dealerCode, email, phone }
@Desc: Dealer Registration
@Access: Public
*/
exports.dealerRegister = async (req, res) => {
    try {
        const validator = new Validator(req.body, {
            name: "required|string",
            dealerCode: "required|string",
            email: "required|email",
            phone: "required|string",
        });

        if (validator.fails()) {
            return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
        }

        const { name, dealerCode, email, phone } = req.body;

        // Prevent duplicate registrations
        const existingDealer = await Dealer.findOne({ where: { email } });
        if (existingDealer) {
            return res.apiError("A dealer with this email already exists", 409);
        }

        const existingDealerCode = await Dealer.findOne({ where: { dealerCode } });
        if (existingDealerCode) {
            return res.apiError("A dealer with this dealer code already exists", 409);
        }

        // Generate OTP
        const otp = generateOTP(6);

        await Dealer.create({
            name,
            dealerCode,
            email,
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
            otp: "required|string|min:4|max:8",
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
            return res.apiError("OTP verification is not required for this account", 400);
        }

        if (!dealer.otp) {
            return res.apiError("No OTP found. Please register again or request a new OTP", 400);
        }


        const isStoredOtpValid = String(dealer.otp) === String(otp);

        if (!isStoredOtpValid) {
            return res.apiError("Invalid OTP", 401);
        }

        await dealer.update({
            otp: null,
            status: "pending",
            isEmailVerified: true,
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

        return res.apiSuccess("OTP verified successfully. Please create your profile.", {
            name: dealer.name,
            dealerCode: dealer.dealerCode,
            email: dealer.email,
            phone: dealer.phone,
            accessToken
        });
    } catch (error) {
        return res.apiError("Internal server error", 500, error);
    }
};


/*
@API: POST /dealer/auth/login
@Body: { email, password }
@Desc: Dealer Login
@Access: Public     
*/
exports.dealerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const validator = new Validator(req.body, {
            email: "required|email",
            password: "required|string|min:6",
        });

        if (validator.fails()) {
            return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
        }

        const dealer = await Dealer.findOne({
            where: { email },
        });

        if (!dealer) {
            return res.apiError("Dealer not found", 404);
        }

        if (dealer && !dealer.password) {
            return res.apiError("Your password is not set.", 404);
        }

        const isPasswordValid = await comparePassword(password, dealer.password);

        if (!isPasswordValid) {
            return res.apiError("Invalid credentials", 401);
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

        return res.apiSuccess("Login successful", {
            name: dealer.name,
            dealerCode: dealer.dealerCode,
            email: dealer.email,
            phone: dealer.phone,
            accessToken
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

        return res.apiSuccess("Token refreshed successfully", {
            accessToken,
            name: dealer.name,
            dealerCode: dealer.dealerCode,
            email: dealer.email,
            phone: dealer.phone,
            role: "dealer",
        });


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

        return res.apiSuccess("Logged out successfully", null, { authenticated: false });
    } catch (error) {
        return res.apiError("Logout failed", 500, error);
    }
};