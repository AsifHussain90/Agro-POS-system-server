import { FarmerRequest } from "../model/farmerRequest.model.js";
import { User } from "../model/user.model.js";
import ApiError from "../utils/errorHandler.js";

export const createFarmerRequestService = ({
  farmerRequestModel = FarmerRequest,
  userModel = User,
} = {}) => ({
  createFarmerRequest: async (userId, payload) => {
    // 1. Make sure the user exists
    const user = await userModel
      .findById(userId)
      .select("fullName email role");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // 2. Only normal users can request a farmer account
    if (user.role !== "user") {
      throw new ApiError(
        403,
        "Only users can submit a farmer account request",
      );
    }

    // 3. One FarmerRequest per User
    const existingRequest = await farmerRequestModel.findOne({
      userId,
    });

    if (existingRequest) {
      throw new ApiError(
        409,
        "You already have a farmer account request",
      );
    }

    // 4. Create FarmerRequest
    try {
      const request = await farmerRequestModel.create({
        // Existing User reference
        userId,

        // Snapshot of User information
        userInfo: {
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },

        // Farmer information
        farmName: payload.farmName,
        farmDescription: payload.farmDescription,

        location: payload.location,

        farmSize: payload.farmSize,

        crops: payload.crops,

        certifications: payload.certifications || [],

        farmImages: payload.farmImages || [],

        // New requests are always pending
        status: "pending",
      });

      // 5. Populate User information
      return await request.populate(
        "userId",
        "fullName email role",
      );
    } catch (error) {
      // Handle race condition caused by unique userId
      if (error.code === 11000) {
        throw new ApiError(
          409,
          "You already have a farmer account request",
        );
      }

      throw error;
    }
  },
});
//gets all farmer requests for a specific user, sorted by creation
//  date in descending order, and populates the user details
//  (full name, email, and role)for each request.
// getMyFarmerRequests: async (userId) => {
//   return farmerRequestModel
//     .find({ userId })
//     .sort({ createdAt: -1 })
//     .populate("userId", "fullName email role");
// },

/*
  updateFarmerRequest: async (userId, payload) => {
    const request = await farmerRequestModel.findOne({
      userId,
      status: "pending",
    });
    if (!request) {
      throw new ApiError(404, "Pending farmer request not found");
    }

    Object.assign(request, payload);
    await request.save();

    return request.populate("userId", "fullName email role");
  },
//deletes a pending farmer request for a specific user.
//  If no pending request is found, it throws a 404 error.
  deleteFarmerRequest: async (userId) => {
    const request = await farmerRequestModel.findOne({
      userId,
      status: "pending",
    });
    if (!request) {
      throw new ApiError(404, "Pending farmer request not found");
    }

    await request.deleteOne();
    return { deleted: true };
  },

  getAllFarmerRequests: async () => {
    return farmerRequestModel
      .find()
      .sort({ createdAt: -1 })
      .populate("userId", "fullName email role");
  },
//gets a specific farmer request by its ID, and populates the 
// user details (full name, email, and role) associated with that 
// request. If the request is not found, it throws a 404 error.
  getFarmerRequestById: async (id) => {
    const request = await farmerRequestModel
      .findById(id)
      .populate("userId", "fullName email role");
    if (!request) throw new ApiError(404, "Farmer request not found");
    return request;
  },
//approves a farmer request by its ID. It updates the request's status to "approved",
// generates a temporary password for the user, hashes it, and updates the user's role to "farmer".
// It also creates a new farmer record and sends an email to the user with their temporary password.
  approveFarmerRequest: async (id, { reviewedBy, reviewMessage }) => {
    const request = await farmerRequestModel.findById(id);
    if (!request) throw new ApiError(404, "Farmer request not found");
    if (request.status !== "pending") {
      throw new ApiError(400, "Request is already processed");
    }
    const user = await userModel.findById(request.userId);
    if (!user) throw new ApiError(404, "User not found");

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcryptLib.hash(temporaryPassword, 10);

    request.status = "approved";
    request.reviewedBy = reviewedBy;
    request.reviewMessage = reviewMessage || "Approved by admin";
    request.approvedAt = new Date();
    await request.save();

    const farmer = await farmerModel.create({
      userId: user._id,
      requestId: request._id,
      farmName: request.farmName,
      phone: request.phone,
      address: request.address,
      description: request.description,
    });

    user.role = "farmer";
    user.password = temporaryPassword;
    user.mustChangePassword = true;
    await user.save();

    await emailSender({
      to: user.email,
      subject: "Your Farmer Account Has Been Approved",
      html: `Your farmer request has been approved. Temporary password: <strong>${temporaryPassword}</strong>`,
    });

    return {
      request,
      farmer,
      user,
      temporaryPassword,
    };
  },

  rejectFarmerRequest: async (id, { reviewedBy, reviewMessage }) => {
    const request = await farmerRequestModel.findById(id);
    if (!request) throw new ApiError(404, "Farmer request not found");
    if (request.status !== "pending") {
      throw new ApiError(400, "Request is already processed");
    }

    request.status = "rejected";
    request.reviewedBy = reviewedBy;
    request.reviewMessage = reviewMessage || "Rejected by admin";
    await request.save();

    return request;
  },
});
 */

const farmerRequestService = createFarmerRequestService();

export const createFarmerRequest = farmerRequestService.createFarmerRequest;
// export const getMyFarmerRequests = farmerRequestService.getMyFarmerRequests;
// export const updateFarmerRequest = farmerRequestService.updateFarmerRequest;
// export const deleteFarmerRequest = farmerRequestService.deleteFarmerRequest;
// export const getAllFarmerRequests = farmerRequestService.getAllFarmerRequests;
// export const getFarmerRequestById = farmerRequestService.getFarmerRequestById;
// export const approveFarmerRequest = farmerRequestService.approveFarmerRequest;
// export const rejectFarmerRequest = farmerRequestService.rejectFarmerRequest;
