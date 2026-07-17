const { Dealer } = require("../../../database/models");
const { comparePassword } = require("../../../utils/passwordUtil");
const { generateAccessToken, generateRefreshToken } = require("../../../utils/jwtUtil");


/*
@API: POST /dealer/auth/login
@Body: { email, password }
@Desc: Dealer Login
@Access: Public     
*/
exports.dealerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const dealer = await Dealer.findOne({
            where: { email },
        });

        if (!dealer) {
            return res.apiError("Dealer not found", 404);
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

        return res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            dealer: {
                id: dealer.id,
                name: dealer.name,
                email: dealer.email,
                role: "dealer"
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

        return res.apiSuccess("Logged out successfully", null, { authenticated: false });
    } catch (error) {
        return res.apiError("Logout failed", 500, error);
    }
};