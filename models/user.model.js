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
      enum: ['user', 'visitor', 'admin', 'farmer'],
      default: 'user',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    ChangePassword: {
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
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    refreshTokenVersion: {
      type: Number,
      default: 0,
      select: false,
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

userSchema.methods.roles = function () {
  return this.role;
};
userSchema.methods.clearRefreshToken = async function () {
  this.refreshToken = null;
  await this.save({ validateBeforeSave: false });
};

export const User = mongoose.model('User', userSchema);