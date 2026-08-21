import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    role: {
      type: String,
      enum: ['superAdmin', 'admin', 'user', 'farmer', 'buyer', 'visitor'],
      default: 'user',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
      minlength: [8, 'Password must be at least 8 characters'],
    },
    changePassword: {
      type: Boolean,
      default: false,
    },
    avatar: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
      _id: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    refreshTokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      sparse: true,
      index: true,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, isActive: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.setRefreshToken = async function (refreshToken) {
  this.refreshToken = refreshToken;
  this.refreshTokenVersion = (this.refreshTokenVersion ?? 0) + 1;
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.isRefreshTokenValid = async function (refreshToken) {
  return this.refreshToken === refreshToken;
};

userSchema.methods.clearRefreshToken = async function () {
  this.refreshToken = null;
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    isBlocked: this.isBlocked,
    avatar: this.avatar,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = mongoose.model('User', userSchema);