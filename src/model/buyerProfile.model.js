import mongoose from 'mongoose';

const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },
    street: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const buyerProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    alternatePhone: {
      type: String,
      default: null,
      trim: true,
    },
    cnic: {
      type: String,
      default: null,
      trim: true,
    },
    savedAddresses: {
      type: [addressSchema],
      default: [],
    },
    deliveryPreferences: {
      type: {
        type: String,
        enum: ['home_delivery', 'farm_pickup'],
        default: 'home_delivery',
      },
      timeSlot: {
        type: String,
        enum: ['morning', 'afternoon', 'evening'],
        default: 'morning',
      },
      instructions: {
        type: String,
        default: '',
        trim: true,
      },
    },
    paymentPreference: {
      type: String,
      enum: ['cash_on_delivery', 'bank_transfer', 'jazzcash', 'easypaisa'],
      default: 'cash_on_delivery',
    },
    // FIXED: Added _id: false to prevent unnecessary subdocument IDs
    businessDetails: {
      type: {
        name: {
          type: String,
          trim: true,
        },
        type: {
          type: String,
          enum: ['restaurant', 'retail', 'processing', 'other'],
        },
        ntn: {
          type: String,
          trim: true,
        },
      },
      _id: false,
    },
    termsAccepted: {
      type: Boolean,
      default: false,
    },
    freshnessPolicyAccepted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const BuyerProfile = mongoose.model('BuyerProfile', buyerProfileSchema);