import mongoose from "mongoose";
const { Schema } = mongoose;
const farmerSchema = new Schema(
  {
    /**
     * ONE-TO-ONE REFERENCE TO USER
     * This field links the farmer profile to exactly one user account.
     * unique: true enforces the one-to-one constraint at the schema level.
     */
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // Tells Mongoose which model to populate from
      required: [true, "User reference is required"],
      unique: true, // CRITICAL: Enforces one-to-one relationship
      index: true, // Index for fast lookups by user ID
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
        required: true,
      },
      //   coordinates: {
      //     type: [Number],      // [longitude, latitude] — GeoJSON standard order
      //     default: [0, 0]
      //   },
      address: {
        street: String,
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, default: "India" },
        zipCode: String,
      },
    },

    /** Farm size in acres (business metric for buyers) */
    farmSize: {
      value: { type: Number, min: 0 },
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

const Farmer = mongoose.model("Farmer", farmerSchema);

farmerSchema.pre("save", function (next) {
  // Ensure that the user reference is unique before saving
  if (!this.isModified("user")) return next();
});

export { Farmer };
