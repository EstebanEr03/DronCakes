import * as droneService from "../services/droneService.js";

// GET /api/drones
export const getDrones = (req, res) => {
  res.json(droneService.getAllDrones());
};

// PUT /api/drones/:id
export const updateDrone = (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    const updatedDrone = droneService.updateDroneStatus(id, available);
    res.json({
      message: "Estado del dron actualizado correctamente",
      drone: updatedDrone,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
