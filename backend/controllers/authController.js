const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);


const register = async (req, res) => {
    try {
        const { name, email, password, phone, address, city, postalCode, country } = req.body;
        
       
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.create({ 
            name, email, password, phone, address, city, postalCode, country,
            emailVerificationToken: hashedOtp,
            emailVerificationExpire: Date.now() + 15 * 60 * 1000, // 15 minutes
            isVerified: false
        });

        const message = `Welcome to Pandit Shop! \n\nYour OTP for email verification is: ${otp}\n\nThis OTP is valid for 15 minutes.`;
        
        const html = `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f1f5f9; padding: 40px 20px; color: #334155;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">PANDIT <span style="color: #ef4444;">FASHION</span></h1>
                        <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">Secure Authentication System</p>
                    </div>
                    <div style="padding: 40px; text-align: center;">
                        <h2 style="color: #1e293b; font-size: 22px; margin-top: 0;">Verify Your Email Address</h2>
                        <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                            Hello <strong style="color: #1e293b;">${name}</strong>,<br>
                            Thank you for joining Pandit Fashion. To complete your registration and secure your new account, please use the verification code below:
                        </p>
                        
                        <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 25px; margin: 0 auto; max-width: 300px;">
                            <span style="display: block; font-family: monospace; font-size: 42px; font-weight: 800; color: #1e293b; letter-spacing: 6px;">
                                ${otp}
                            </span>
                        </div>
                        
                        <p style="color: #ef4444; font-size: 14px; margin-top: 30px; font-weight: 500;">
                            ⚠️ This code is securely generated and will expire in exactly 15 minutes.
                        </p>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                            If you did not request this email, please ignore this message.<br>
                            &copy; ${new Date().getFullYear()} Pandit Fashion. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify your Pandit Fashion Account',
                message,
                html
            });
            res.status(201).json({ success: true, message: 'Registration successful! Please check your email for the OTP.' });
        } catch (emailErr) {
            user.emailVerificationToken = undefined;
            user.emailVerificationExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Registered but OTP email failed to send.' });
        }
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
        }

        const hashedOtp = crypto.createHash('sha256').update(otp.toString()).digest('hex');
        
        const user = await User.findOne({ 
            email,
            emailVerificationToken: hashedOtp, 
            emailVerificationExpire: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Email verified successfully! You can now log in.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.isVerified === false) {
            return res.status(401).json({ success: false, message: 'Please verify your email address to login' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email, role: user.role, avatar: user.avatar } });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email, role: user.role } });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, phone, gender, dob, address, city, postalCode, country, avatar, addresses } = req.body;
        const updateFields = {};
        if (name)       updateFields.name       = name;
        if (phone)      updateFields.phone      = phone;
        if (gender)     updateFields.gender     = gender;
        if (dob)        updateFields.dob        = dob;
        if (address)    updateFields.address    = address;
        if (city)       updateFields.city       = city;
        if (postalCode) updateFields.postalCode = postalCode;
        if (country)    updateFields.country    = country;
        if (avatar !== undefined) updateFields.avatar = avatar;
        if (addresses)  updateFields.addresses = addresses;

        const user = await User.findByIdAndUpdate(req.user.id, updateFields, { returnDocument: 'after', runValidators: true });
        // Update stored token data
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Limit to maximum 2 addresses
        if (user.addresses.length >= 2) {
            return res.status(400).json({ success: false, message: "Maximum of 2 addresses allowed" });
        }

        const { fullName, mobileNumber, houseNumber, street, city, state, pincode, addressType, isDefault } = req.body;
        
        const newAddress = { fullName, mobileNumber, houseNumber, street, city, state, pincode, addressType, isDefault };
        
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        } else if (user.addresses.length === 0) {
            newAddress.isDefault = true;
        }
        
        user.addresses.push(newAddress);
        await user.save();
        res.status(201).json({ success: true, data: user.addresses });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const addressId = req.params.id;
        const { fullName, mobileNumber, houseNumber, street, city, state, pincode, addressType, isDefault } = req.body;
        
        const addrIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addrIndex === -1) return res.status(404).json({ success: false, message: "Address not found" });
        
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }
        
        user.addresses[addrIndex] = {
            ...user.addresses[addrIndex].toObject(),
            fullName, mobileNumber, houseNumber, street, city, state, pincode, addressType, isDefault
        };
        
        await user.save();
        res.status(200).json({ success: true, data: user.addresses });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const addressId = req.params.id;
        
        const addrIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addrIndex === -1) return res.status(404).json({ success: false, message: "Address not found" });
        
        const wasDefault = user.addresses[addrIndex].isDefault;
        user.addresses.splice(addrIndex, 1);
        
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }
        
        await user.save();
        res.status(200).json({ success: true, data: user.addresses });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const setDefaultAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const addressId = req.params.id;
        
        user.addresses.forEach(addr => {
            addr.isDefault = addr._id.toString() === addressId;
        });
        
        await user.save();
        res.status(200).json({ success: true, data: user.addresses });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ── Payment Methods Controllers ──

const addPaymentMethod = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { methodType, cardHolder, cardNumber, expiry, cardType, upiId, isDefault } = req.body;
        
        const newMethod = { methodType, cardHolder, cardNumber, expiry, cardType, upiId, isDefault };
        
        if (isDefault) {
            user.paymentMethods.forEach(pm => pm.isDefault = false);
        } else if (user.paymentMethods.length === 0) {
            newMethod.isDefault = true;
        }
        
        user.paymentMethods.push(newMethod);
        await user.save();
        res.status(201).json({ success: true, data: user.paymentMethods });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const deletePaymentMethod = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const methodId = req.params.id;
        
        const methodIndex = user.paymentMethods.findIndex(pm => pm._id.toString() === methodId);
        if (methodIndex === -1) return res.status(404).json({ success: false, message: "Payment method not found" });
        
        const wasDefault = user.paymentMethods[methodIndex].isDefault;
        user.paymentMethods.splice(methodIndex, 1);
        
        if (wasDefault && user.paymentMethods.length > 0) {
            user.paymentMethods[0].isDefault = true;
        }
        
        await user.save();
        res.status(200).json({ success: true, data: user.paymentMethods });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const setDefaultPaymentMethod = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const methodId = req.params.id;
        
        user.paymentMethods.forEach(pm => {
            pm.isDefault = pm._id.toString() === methodId;
        });
        
        await user.save();
        res.status(200).json({ success: true, data: user.paymentMethods });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://127.0.0.1:5173'}/reset-password/${resetToken}`;
        const message = `You requested a password reset. Click the following link to securely change your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;
        
        const html = `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f1f5f9; padding: 40px 20px; color: #334155;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">PANDIT <span style="color: #ef4444;">FASHION</span></h1>
                        <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">Secure Authentication System</p>
                    </div>
                    <div style="padding: 40px; text-align: center;">
                        <h2 style="color: #1e293b; font-size: 22px; margin-top: 0;">Password Reset Request</h2>
                        <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                            We received a request to securely reset the password for your Pandit Fashion account.<br>
                            Click the button below to establish a new password.
                        </p>
                        
                        <a href="${resetUrl}" style="display: inline-block; background: #ef4444; color: #ffffff; padding: 14px 30px; border-radius: 6px; font-size: 16px; font-weight: bold; text-decoration: none; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);">
                            Reset Password
                        </a>
                        
                        <p style="color: #ef4444; font-size: 14px; margin-top: 30px; font-weight: 500;">
                            ⚠️ This secure link will automatically expire in 10 minutes.
                        </p>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                            If you did not request this password reset, please ignore this message. Your account remains secure.<br>
                            &copy; ${new Date().getFullYear()} Pandit Fashion. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token - Pandit Fashion',
                message,
                html
            });
            res.status(200).json({ success: true, message: 'Reset password link sent to your email.' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Failed to send password reset email.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select('+password');

        if (!(await user.comparePassword(currentPassword, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid current password' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
        const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

        if (!user) return res.status(400).json({ success: false, message: 'Invalid token' });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Google OAuth Controllers
const googleAuthUrl = (req, res) => {
    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
    });
    res.json({ success: true, url });
};

const googleAuthCallback = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) return res.redirect(`${process.env.FRONTEND_URL || 'http://127.0.0.1:5173'}/login?error=NoCode`);

        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);
        
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        
        let user = await User.findOne({ email: payload.email });
        if (!user) {
            user = await User.create({
                name: payload.name,
                email: payload.email,
                avatar: payload.picture,
                googleId: payload.sub,
                isVerified: true,
                role: 'user'
            });
        } else if (!user.googleId) {
            user.googleId = payload.sub;
            user.isVerified = true;
            await user.save();
        }
        
        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        
        res.redirect(`${process.env.FRONTEND_URL || 'http://127.0.0.1:5173'}/login?token=${jwtToken}`);
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.redirect(`${process.env.FRONTEND_URL || 'http://127.0.0.1:5173'}/login?error=GoogleAuthFailed`);
    }
};

module.exports = { 
    register, 
    verifyOTP,
    login, 
    adminLogin, 
    getMe, 
    updateProfile, 
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    forgotPassword,
    resetPassword,
    changePassword,
    googleAuthUrl,
    googleAuthCallback
};
