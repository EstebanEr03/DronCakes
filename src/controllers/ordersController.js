import * as orderService from "../services/orderService.js";

export const newOrder = (req, res) => {
  try {
    const { customer, flavor } = req.body;
    const order = orderService.createOrder(customer, flavor);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrders = (req, res) => {
  res.json(orderService.getAllOrders());
};
