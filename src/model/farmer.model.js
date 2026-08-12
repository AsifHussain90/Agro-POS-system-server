import mongoose from 'mongoose';

const { Schema } = mongoose;

// ======================================================
// ADDRESS
// ======================================================

const addressSchema = new Schema(
  {
    street: {
      type: String,
      required: [true, 'Street is required'],
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
  {
    _id: false,
  }
);

// ======================================================
// LOCATION
// ======================================================

const locationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },

    address: {
      type: addressSchema,
      required: true,
    },
  },
  {
    _id: false,
  }
);

// ======================================================
// FARM SIZE
// ======================================================

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
      enum: ['acres', 'hectares'],
    },
  },
  {
    _id: false,
  }
);

// ======================================================
// CROP
// ======================================================

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
  {
    _id: false,
  }
);

// ======================================================
// FARM IMAGE
// ======================================================

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
  {
    _id: false,
  }
);

// ======================================================
// FARMER
// ======================================================

const farmerSchema = new Schema(
  {
    // --------------------------------------------------
    // Existing User account
    // --------------------------------------------------

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },

    // --------------------------------------------------
    // Farm information
    // --------------------------------------------------

    farmName: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
      minlength: [3, 'Farm name must be at least 3 characters'],
      maxlength: [100, 'Farm name cannot exceed 100 characters'],
    },

    farmDescription: {
      type: String,
      required: [true, 'Farm description is required'],
      trim: true,
      minlength: [
        10,
        'Farm description must be at least 10 characters',
      ],
      maxlength: [
        1000,
        'Farm description cannot exceed 1000 characters',
      ],
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

    // --------------------------------------------------
    // Farmer account state
    // --------------------------------------------------

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    approvedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Farmer = mongoose.model('Farmer', farmerSchema);