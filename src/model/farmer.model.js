import mongoose from 'mongoose';

const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    street: { type: String, trim: true, maxlength: 150, default: null },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    country: { type: String, required: true, trim: true, maxlength: 100 },
    zipCode: { type: String, trim: true, maxlength: 20, default: null },
  },
  { _id: false }
);

const locationSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    address: { type: addressSchema, required: true },
  },
  { _id: false }
);

const farmSizeSchema = new Schema(
  {
    value: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, enum: ['acres', 'hectares', 'sqft'] },
  },
  { _id: false }
);

const cropSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, required: true, trim: true, maxlength: 50 },
    season: { type: String, required: true, trim: true, maxlength: 50 },
    isOrganic: { type: Boolean, default: false },
  },
  { _id: false }
);

const farmImageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    caption: { type: String, trim: true, maxlength: 200 },
  },
  { _id: false }
);

const farmerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },

    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'FarmerRequest',
      required: [true, 'Request reference is required'],
    },

    farmName: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
      maxlength: [100, 'Farm name cannot exceed 100 characters'],
    },

    farmDescription: {
      type: String,
      trim: true,
      maxlength: [1000, 'Farm description cannot exceed 1000 characters'],
      default: null,
    },

    location: {
      type: locationSchema,
      required: true,
    },

    farmSize: {
      type: farmSizeSchema,
      required: true,
    },

    crops: {
      type: [cropSchema],
      default: [],
    },

    farmImages: {
      type: [farmImageSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Farmer = mongoose.model('Farmer', farmerSchema);