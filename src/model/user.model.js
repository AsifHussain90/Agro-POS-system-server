import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['superAdmin', 'admin', 'user', 'farmer', 'buyer'],
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
    },
    changePassword: {
      type: Boolean,
      default: false,
    },
    avatar: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
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
      index: true,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.setRefreshToken = async function (refreshToken) {
  this.refreshToken = await bcrypt.hash(refreshToken, 10);
  this.refreshTokenVersion = (this.refreshTokenVersion ?? 0) + 1;
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.isRefreshTokenValid = async function (refreshToken) {
  if (!this.refreshToken) return false;
  return bcrypt.compare(refreshToken, this.refreshToken);
};

userSchema.methods.clearRefreshToken = async function () {
  this.refreshToken = null;
  await this.save({ validateBeforeSave: false });
};

export const User = mongoose.model('User', userSchema);