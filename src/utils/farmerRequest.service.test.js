import test from "node:test";
import assert from "node:assert/strict";
import { createFarmerRequestService } from "../services/farmerRequest.service.js";

test("approveFarmerRequestService promotes the user to farmer and resets password requirements", async () => {
  const requestDoc = {
    _id: "request-1",
    userId: "user-1",
    farmName: "Green Valley",
    phone: "03001234567",
    address: "Lahore",
    description: "Organic farm",
    status: "pending",
    save: async function () {
      this.status = "approved";
      this.approvedAt = new Date("2026-01-01T00:00:00.000Z");
      return this;
    },
  };

  const userDoc = {
    _id: "user-1",
    role: "visitor",
    password: "old-password",
    mustChangePassword: false,
    save: async function () {
      return this;
    },
  };

  const createdFarmer = [];

  const service = createFarmerRequestService({
    farmerRequestModel: {
      findById: async () => requestDoc,
      findOne: async () => null,
    },
    farmerModel: {
      create: async (data) => {
        createdFarmer.push(data);
        return { _id: "farmer-1", ...data };
      },
    },
    userModel: {
      findById: async () => userDoc,
      findByIdAndUpdate: async (_id, update) => ({ ...userDoc, ...update }),
    },
    emailSender: async () => true,
    bcrypt: {
      hash: async (value) => `hashed:${value}`,
    },
  });

  const result = await service.approveFarmerRequest("request-1", {
    reviewedBy: "admin-1",
    reviewMessage: "Approved",
  });

  assert.equal(result.request.status, "approved");
  assert.equal(result.user.role, "farmer");
  assert.equal(result.user.mustChangePassword, true);
  assert.equal(createdFarmer[0].requestId, "request-1");
  assert.match(result.temporaryPassword, /^Temp/);
});
