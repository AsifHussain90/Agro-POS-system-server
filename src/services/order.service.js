import { Order } from "../model/order.model.js";

export const orderService = {
  async getBuyerOrders(buyerId) {
    return Order.find({ buyer: buyerId }).populate("products.product");
  },

  async getFarmerOrders(farmerId) {
    return Order.find({ farmer: farmerId }).populate("products.product");
  },
};
