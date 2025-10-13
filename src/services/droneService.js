import { drones } from "../utils/dataStore.js";

export const getAllDrones = () => drones;

export const updateDroneStatus = (id, available) => {
  const drone = drones.find((d) => d.id === Number(id));
  if (!drone) throw new Error("Dron no encontrado");

  drone.available = available;
  return drone;
};
