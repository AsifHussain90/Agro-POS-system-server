import { User } from '../model/user.model.js';
import ApiError from '../utils/errorHandler.js';
import crypto from 'crypto';

const generateTempPassword = () => {
  return crypto.randomBytes(12).toString('hex');
};

export const createSuperAdminService = ({
  UserModel = User,
} = {}) => ({
  createAdmin: async ({ fullName, email, createdBy }) => {
    const normalizedEmail = email.toLowerCase();

    const exists = await UserModel.findOne({ email: normalizedEmail });
    if (exists) throw new ApiError(409, 'Admin with this email already exists');

    const tempPassword = generateTempPassword();

    const admin = await UserModel.create({
      fullName,
      email: normalizedEmail,
      password: tempPassword,
      role: 'admin',
      createdBy,
      changePassword: true,
      isActive: true,
    });

    return {
      admin: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
      tempPassword,
    };
  },

  getAllAdmins: async ({ page = 1, limit = 10 } = {}) => {
    const skip = (Number(page) - 1) * Number(limit);
    const query = { role: 'admin' };

    const [data, total] = await Promise.all([
      UserModel.find(query)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'fullName email'),
      UserModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  },

  getAdminById: async (id) => {
    const admin = await UserModel.findById(id)
      .select('-password -refreshToken')
      .populate('createdBy', 'fullName email');
    if (!admin) throw new ApiError(404, 'Admin not found');
    return admin;
  },

  toggleAdminStatus: async (id, activate) => {
    const admin = await UserModel.findById(id);
    if (!admin) throw new ApiError(404, 'Admin not found');
    if (admin.role !== 'admin') {
      throw new ApiError(400, 'Target user is not an admin');
    }

    admin.isActive = activate;
    await admin.save({ validateBeforeSave: false });

    return {
      adminId: admin._id,
      isActive: admin.isActive,
    };
  },

  deleteAdmin: async (id) => {
    const admin = await UserModel.findById(id);
    if (!admin) throw new ApiError(404, 'Admin not found');
    if (admin.role !== 'admin') {
      throw new ApiError(400, 'Target user is not an admin');
    }

    await admin.deleteOne();
    return { deleted: true };
  },
});

const superAdminService = createSuperAdminService();

export const createAdmin = superAdminService.createAdmin;
export const getAllAdmins = superAdminService.getAllAdmins;
export const getAdminById = superAdminService.getAdminById;
export const toggleAdminStatus = superAdminService.toggleAdminStatus;
export const deleteAdmin = superAdminService.deleteAdmin;