import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import orderRoutes from './routes/orderRoutes.js'
import droneRoutes from './routes/droneRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')))

app.use('/api/orders', orderRoutes)
app.use('/api/drones', droneRoutes)

app.get('/api', (req, res) => res.send('🚁 DronCakes API funcionando'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`))
