import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import {
  createAdmin,
  getAllAdmins,
  getAdminById,
  toggleAdminStatus,
  deleteAdmin,
} from '../../services/superAdmin.service.js';

export const createAdminController = asyncHandler(async (req, res) => {
  const result = await createAdmin({
    ...req.body,
    createdBy: req.user._id,
  });
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        result,
        'Admin created successfully. Share the temporary password securely.'
      )
    );
});

export const getAllAdminsController = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const admins = await getAllAdmins({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, admins, 'Admins retrieved'));
});

export const getAdminByIdController = asyncHandler(async (req, res) => {
  const admin = await getAdminById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, admin, 'Admin retrieved'));
});

export const activateAdminController = asyncHandler(async (req, res) => {
  const result = await toggleAdminStatus(req.params.id, true);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Admin activated'));
});

export const deactivateAdminController = asyncHandler(async (req, res) => {
  const result = await toggleAdminStatus(req.params.id, false);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Admin deactivated'));
});

export const deleteAdminController = asyncHandler(async (req, res) => {
  const result = await deleteAdmin(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Admin deleted'));
});