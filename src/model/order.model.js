import mongoose from 'mongoose';

const { Schema } = mongoose;

const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Price at time of order is required'],
      min: [0, 'Price cannot be negative'],
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer reference is required'],
      index: true,
    },

    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer reference is required'],
      index: true,
    },

    products: {
      type: [orderItemSchema],
      required: [true, 'At least one product is required'],
      validate: {
        validator: (items) => items.length > 0,
        message: 'At least one product is required',
      },
    },

    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model('Order', orderSchema);