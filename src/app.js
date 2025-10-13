import express from "express";
import orderRoutes from "./routes/orderRoutes.js";
import droneRoutes from "./routes/droneRoutes.js";

const app = express();
app.use(express.json());

app.use("/api/orders", orderRoutes);
app.use("/api/drones", droneRoutes);

app.get("/", (req, res) => res.send("🚁 DronCakes API funcionando"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
