import { drones, orders } from "../utils/dataStore.js";

export const createOrder = (customer, flavor) => {
  const availableDrone = drones.find((d) => d.available);
  if (!availableDrone) throw new Error("No hay drones disponibles");

  const newOrder = {
    id: orders.length + 1,
    customer,
    flavor,
    drone: availableDrone.name,
    status: "en vuelo",
  };

  availableDrone.available = false;
  orders.push(newOrder);

  return newOrder;
};

export const getAllOrders = () => orders;
