const { Admin } = require("../../../database/models");
const Validator = require("validatorjs");
const {
    comparePassword,
    hashPassword,
    generateTempPassword,
} = require("../../../utils/passwordUtil");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../../../utils/jwtUtil");
const { addEmailJob } = require("../../../queues");


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

        if (admin.isActive === false) {
            return res.apiError("Your account is not active. Please contact support", 403);
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
                role: "admin",
                mustChangePassword: admin.mustChangePassword,
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

/*
@API: POST /admin/auth/change-password
@Body: { currentPassword, newPassword, confirmPassword }
@Desc: Change admin password
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
        const admin = await Admin.findByPk(req.auth.id);

        if (!admin) {
            return res.apiError("Admin not found", 404);
        }

        const isCurrentPasswordValid = await comparePassword(
            currentPassword,
            admin.password,
        );

        if (!isCurrentPasswordValid) {
            return res.apiError("Current password is incorrect", 401);
        }

        const isSamePassword = await comparePassword(newPassword, admin.password);
        if (isSamePassword) {
            return res.apiError(
                "New password must be different from current password",
                422,
            );
        }

        await admin.update({
            password: await hashPassword(newPassword),
            mustChangePassword: false,
        });

        return res.apiSuccess("Password changed successfully");
    } catch (error) {
        return res.apiError("Internal server error", 500, error);
    }
};

/*
@API: POST /admin/auth/forgot-password
@Body: { email }
@Desc: Send temporary password to admin email
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
        const admin = await Admin.findOne({ where: { email } });

        if (admin && admin.isActive !== false) {
            const tempPassword = generateTempPassword(8);

            await admin.update({
                password: await hashPassword(tempPassword),
                mustChangePassword: true,
                refreshToken: null,
            });

            await addEmailJob({
                to: admin.email,
                subject: "FADA-ID Admin Temporary Password",
                templateName: "temp-password.ejs",
                data: {
                    name: admin.name || "Admin",
                    tempPassword,
                },
            });
        }

        return res.apiSuccess(
            "If an account exists with this email, a temporary password has been sent",
        );
    } catch (error) {
        return res.apiError("Internal server error", 500, error);
    }
};

const toAdminProfile = (admin) => ({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    profilePicture: admin.profilePicture,
    role: "admin",
    isActive: admin.isActive,
    mustChangePassword: admin.mustChangePassword,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
});

/*
@API: GET /admin/auth/profile
@Desc: Get authenticated admin profile
@Access: Private
*/
exports.getProfile = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.auth.id, {
                attributes: ["id", "name", "email", "phone", "profilePicture", "isActive", "createdAt", "updatedAt"],
        });

        if (!admin) {
            return res.apiError("Admin not found", 404);
        }

        return res.apiSuccess("Profile fetched successfully", toAdminProfile(admin));
    } catch (error) {
        return res.apiError("Internal server error", 500, error);
    }
};

/*
@API: PUT /admin/auth/profile
@Body: { name?, email?, phone?, profilePicture? }
@Desc: Update authenticated admin profile
@Access: Private
*/
exports.updateProfile = async (req, res) => {
    try {
        const validator = new Validator(req.body, {
            name: "required|string",
            email: "required|email",
            phone: "required|string", 
        });

        if (validator.fails()) {
            return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
        }

        const admin = await Admin.findByPk(req.auth.id);
        if (!admin) {
            return res.apiError("Admin not found", 404);
        }

        const { name, email, phone } = req.body;
        const profilePicture = req.file && req.file.filename ? `${process.env.API_URL}/uploads/${req.file.filename}` : admin.profilePicture;
        const updates = {};

        if (name !== undefined) updates.name = name;
        if (phone !== undefined) updates.phone = phone;
        if (profilePicture !== undefined) updates.profilePicture = profilePicture;

        if (email !== undefined && email !== admin.email) {
            const existing = await Admin.findOne({ where: { email } });
            if (existing) {
                return res.apiError("An admin with this email already exists", 409);
            }
            updates.email = email;
        }

        if (Object.keys(updates).length === 0) {
            return res.apiError("No valid fields provided to update", 422);
        }

        await admin.update(updates);

        return res.apiSuccess(
            "Profile updated successfully",
            toAdminProfile(admin),
        );
    } catch (error) {
        return res.apiError("Internal server error", 500, error);
    }
};