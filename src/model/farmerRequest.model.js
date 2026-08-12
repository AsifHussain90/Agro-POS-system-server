import mongoose from 'mongoose';

const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    street: {
      type: String,
      trim: true,
      maxlength: [150, 'Street cannot exceed 150 characters'],
    },

    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },

    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters'],
    },

    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true,
      maxlength: [20, 'Zip code cannot exceed 20 characters'],
    },
  },
  { _id: false }
);
const locationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },

    address: {
      type: addressSchema,
      required: true,
    },
  },
  { _id: false }
);


const farmSizeSchema = new Schema(
  {
    value: {
      type: Number,
      required: [true, 'Farm size value is required'],
      min: [0, 'Farm size must be greater than 0'],
    },

    unit: {
      type: String,
      required: [true, 'Farm size unit is required'],
      enum: ['acres', 'hectares','sqft'],
    },
  },
  { _id: false }
);

const cropSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      maxlength: [100, 'Crop name cannot exceed 100 characters'],
    },

    category: {
      type: String,
      required: [true, 'Crop category is required'],
      trim: true,
      maxlength: [50, 'Crop category cannot exceed 50 characters'],
    },

    season: {
      type: String,
      required: [true, 'Crop season is required'],
      trim: true,
      maxlength: [50, 'Crop season cannot exceed 50 characters'],
    },

    isOrganic: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const farmImageSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, 'Farm image URL is required'],
      trim: true,
    },

    caption: {
      type: String,
      trim: true,
      maxlength: [200, 'Image caption cannot exceed 200 characters'],
    },
  },
  { _id: false }
);

const userInfoSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    role: {
      type: String,
      enum: ['user'],
      default: 'user',
    },
  },
  { _id: false }
);

const farmerRequestSchema = new Schema(
  {
    // Reference to the existing User
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },

    // Snapshot of user information at the time of application
    userInfo: {
      type: userInfoSchema,
      required: true,
    },

    // Farmer information
    farmName: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
      maxlength: [100, 'Farm name cannot exceed 100 characters'],
    },

    farmDescription: {
      type: String,
      required: [true, 'Farm description is required'],
      trim: true,
      maxlength: [1000, 'Farm description cannot exceed 1000 characters'],
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
      required: [true, 'At least one crop is required'],
      validate: {
        validator: (crops) => crops.length > 0,
        message: 'At least one crop is required',
      },
    },


    farmImages: {
      type: [farmImageSchema],
      default: [],
    },

    // Admin review information
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    reviewMessage: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review message cannot exceed 1000 characters'],
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const FarmerRequest = mongoose.model(
  'FarmerRequest',
  farmerRequestSchema
);
