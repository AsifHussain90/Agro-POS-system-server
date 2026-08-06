import mongoose from "mongoose";
const { Schema } = mongoose;

const farmerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "FarmerRequest",
      default: null,
      index: true,
    },

    // ==================== FARMER-SPECIFIC BUSINESS DATA ====================

    /** Farm identity and branding */
    farmName: {
      type: String,
      required: [true, "Farm name is required"],
      trim: true,
      maxlength: [100, "Farm name cannot exceed 100 characters"],
    },
    farmDescription: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    location: {
      type: {
        type: String,
        default: "Point",
      },
      address: {
        street: String,
        city: { type: String, default: "Lahore" },
        state: { type: String, default: "Punjab" },
        country: { type: String, default: "Pakistan" },
        zipCode: String,
      },
    },

    /** Farm size in acres (business metric for buyers) */
    farmSize: {
      value: { type: Number, min: 0, default: 0 },
      unit: {
        type: String,
        enum: ["acres", "hectares", "sqft"],
        default: "acres",
      },
    },

    /** Crops currently cultivated (array allows multiple crops) */
    crops: [
      {
        name: { type: String, required: true },
        category: {
          type: String,
          enum: ["vegetable", "fruit", "grain", "pulse", "other"],
        },
        season: {
          type: String,
          enum: ["kharif", "rabi", "zaid", "year-round"],
        },
        isOrganic: { type: Boolean, default: false },
      },
    ],

    /** Certifications (organic, fair trade, etc.) */
    certifications: [
      {
        name: { type: String, required: true },
        issuedBy: String,
        issuedDate: Date,
        expiryDate: Date,
        certificateNumber: String,
        documentUrl: String, // URL to scanned certificate
      },
    ],

    /** Farm photos for marketplace display */
    farmImages: [
      {
        url: String,
        caption: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    /** Application and approval workflow */
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },

    /** Business status */
    isVerified: {
      type: Boolean,
      default: false, // Admin verifies farmer before marketplace listing
    },

    /** Soft delete support (better than hard delete for audit trails) */
    isActive: {
      type: Boolean,
      default: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

farmerSchema.pre("validate", function () {
  if (this.user && !this.userId) {
    this.userId = this.user;
  }
  if (this.userId && !this.user) {
    this.user = this.userId;
  }
});

const Farmer = mongoose.model("Farmer", farmerSchema);

export { Farmer };
