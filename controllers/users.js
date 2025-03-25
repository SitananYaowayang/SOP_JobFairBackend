const User = require('../models/User');
const jwt = require('jsonwebtoken');

class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const asyncHandler = (fn) => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

const userController = {
  updateDetails: asyncHandler(async (req, res, next) => {
    const updateFields = {};
    const allowedFields = ['name', 'email', 'tel'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    if (Object.keys(updateFields).length === 0) {
      return next(new ErrorResponse('No valid fields provided for update', 400));
    }

    // Check for duplicate email
    if (updateFields.email) {
      const existingUser = await User.findOne({
        email: updateFields.email,
        _id: { $ne: req.user.id }
      });
      
      if (existingUser) {
        return next(new ErrorResponse('Email is already taken', 400));
      }
    }

    // Check for duplicate telephone number
    if (updateFields.tel) {
      const existingUser = await User.findOne({
        tel: updateFields.tel,
        _id: { $ne: req.user.id }
      });
      
      if (existingUser) {
        return next(new ErrorResponse('Telephone number is already taken', 400));
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  }),

  updatePassword: asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = user.getSignedJwtToken();
    res.status(200).json({
      success: true,
      token
    });
  })
};

module.exports = userController;