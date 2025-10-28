import * as orderService from '../services/orderService.js'

export const newOrder = (req, res) => {
  try {
    const { customer, flavor } = req.body
    const order = orderService.createOrder(customer, flavor)
    res.status(201).json(order)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const getOrders = (req, res) => {
  res.json(orderService.getAllOrders())
}

export const updateOrderStatus = (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const order = orderService.updateOrderStatus(Number(id), status)
    res.json({
      message: 'Estado de la orden actualizado correctamente',
      order
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const completeOrder = (req, res) => {
  try {
    const { id } = req.params
    const order = orderService.completeOrder(Number(id))
    res.json({
      message: 'Orden marcada como entregada',
      order
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
