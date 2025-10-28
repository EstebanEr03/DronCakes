import { drones, orders } from "../utils/dataStore.js";

export const createOrder = (customer, flavor) => {
  const availableDrone = drones.find((d) => d.available);
  if (!availableDrone) throw new Error("No hay drones disponibles");

  const newOrder = {
    id: orders.length + 1,
    customer,
    flavor,
    drone: availableDrone.name,
    droneId: availableDrone.id,
    status: "preparando",
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
  };

  availableDrone.available = false;
  orders.push(newOrder);

  // Simular el proceso de entrega automático
  setTimeout(() => {
    try {
      console.log(`Cambiando orden ${newOrder.id} a "en vuelo"`);
      updateOrderStatus(newOrder.id, "en vuelo");
    } catch (error) {
      console.error("Error al cambiar a en vuelo:", error);
    }
  }, 3000); // 3 segundos preparando
  
  setTimeout(() => {
    try {
      console.log(`Cambiando orden ${newOrder.id} a "entregado"`);
      updateOrderStatus(newOrder.id, "entregado");
    } catch (error) {
      console.error("Error al cambiar a entregado:", error);
    }
  }, 10000); // 10 segundos total

  return newOrder;
};

export const getAllOrders = () => orders;

export const updateOrderStatus = (orderId, newStatus) => {
  const order = orders.find(o => o.id === orderId);
  if (!order) throw new Error("Orden no encontrada");
  
  order.status = newStatus;
  
  // Si se entrega, liberar el dron
  if (newStatus === "entregado") {
    const drone = drones.find(d => d.id === order.droneId);
    if (drone) {
      drone.available = true;
      order.deliveredAt = new Date().toISOString();
    }
  }
  
  return order;
};

export const completeOrder = (orderId) => {
  return updateOrderStatus(orderId, "entregado");
};
