import { createFarmerRequestService } from "./src/services/farmerRequest.service.js";

const service = createFarmerRequestService({
  farmerRequestModel: {
    findById: async () => ({
      _id: "r1",
      userId: "u1",
      farmName: "Green Valley",
      phone: "0300",
      address: "Lahore",
      description: "desc",
      status: "pending",
      save: async function () {
        this.status = "approved";
        this.approvedAt = new Date();
        return this;
      },
    }),
    findOne: async () => null,
  },
  farmerModel: {
    create: async (data) => ({ _id: "f1", ...data }),
  },
  userModel: {
    findById: async () => ({
      _id: "u1",
      role: "visitor",
      password: "old",
      mustChangePassword: false,
      save: async function () {
        return this;
      },
    }),
  },
  emailSender: async () => true,
  bcryptLib: {
    hash: async (value) => `hashed:${value}`,
  },
});

const result = await service.approveFarmerRequest("r1", {
  reviewedBy: "a1",
  reviewMessage: "ok",
});

console.log(
  JSON.stringify(
    {
      status: result.request.status,
      role: result.user.role,
      mustChangePassword: result.user.mustChangePassword,
      temp: result.temporaryPassword,
    },
    null,
    2,
  ),
);
