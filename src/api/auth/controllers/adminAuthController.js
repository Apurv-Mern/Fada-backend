const { Admin } = require("../../../database/models");
const { comparePassword } = require("../../../utils/passwordUtil");
const { generateAccessToken, generateRefreshToken } = require("../../../utils/jwtUtil");


/*
@API: POST /admin/auth/login
@Body: { email, password }
@Desc: Admin Login
@Access: Public     
*/
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({
            where: { email },
        });

        if (!admin) {
            return res.apiError("Admin not found", 404);
        }

        const isPasswordValid = await comparePassword(password, admin.password);

        if (!isPasswordValid) {
            return res.apiError("Invalid credentials", 401);
        }


        // Generate Tokens
        const accessToken = generateAccessToken({
            id: admin.id,
            email: admin.email,
            role: "admin",
        });

        const refreshToken = generateRefreshToken({
            id: admin.id,
            email: admin.email,
            role: "admin",
        });

        // Save refresh token in DB (Recommended)
        await admin.update({
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
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: "admin"
            },
        });
    } catch (error) {
        return res.apiError("Internal server error", 500, error);
    }
};


/*
@API: POST /admin/auth/refresh-token
@Body: {}
@Desc: Refresh Access Token
@Access: Public (Requires Refresh Token in Cookie)
*/
exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.apiError("Refresh token not provided", 401);
        }

        const payload = verifyRefreshToken(refreshToken);

        const admin = await Admin.findByPk(payload.id);

        if (!admin || admin.refreshToken !== refreshToken) {
            return res.apiError("Invalid refresh token", 403);
        }

        const accessToken = generateAccessToken({
            id: admin.id,
            email: admin.email,
            role: "admin",
        });

        const newRefreshToken = generateRefreshToken({
            id: admin.id,
            email: admin.email,
            role: "admin",
        });

        await admin.update({
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
@API: POST /admin/auth/logout
@Body: {}
@Desc: Admin Logout
@Access: Public (Requires Refresh Token in Cookie)
*/
exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            const admin = await Admin.findOne({
                where: { refreshToken },
            });

            if (admin) {
                await admin.update({
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