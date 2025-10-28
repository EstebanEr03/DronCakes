import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import * as orderService from '../../src/services/orderService.js'
import { drones, orders } from '../../src/utils/dataStore.js'

describe('Order Service - Unit Tests', () => {
  beforeEach(() => {
    // Reset state before each test
    orders.length = 0
    drones.forEach(drone => {
      drone.available = true
    })
    
    // Clear any existing timers
    jest.clearAllTimers()
  })

  describe('createOrder', () => {
    test('should create order successfully with available drone', () => {
      const customer = 'Juan Pérez'
      const flavor = 'chocolate'
      
      const order = orderService.createOrder(customer, flavor)
      
      expect(order).toBeDefined()
      expect(order.customer).toBe(customer)
      expect(order.flavor).toBe(flavor)
      expect(order.id).toBe(1)
      expect(order.status).toBe('preparando')
      expect(order.drone).toBeDefined()
      expect(order.droneId).toBeDefined()
      expect(order.createdAt).toBeDefined()
      expect(order.estimatedDelivery).toBeDefined()
    })

    test('should assign first available drone', () => {
      drones[0].available = false // Make first drone unavailable
      
      const order = orderService.createOrder('María García', 'vainilla')
      
      expect(order.droneId).toBe(2) // Should assign second drone
      expect(order.drone).toBe('PastelExpress')
      expect(drones[1].available).toBe(false) // Drone should be marked as busy
    })

    test('should throw error when no drones available', () => {
      // Make all drones unavailable
      drones.forEach(drone => {
        drone.available = false
      })
      
      expect(() => {
        orderService.createOrder('Pedro López', 'fresa')
      }).toThrow('No hay drones disponibles')
    })

    test('should increment order ID correctly', () => {
      const order1 = orderService.createOrder('Cliente 1', 'chocolate')
      const order2 = orderService.createOrder('Cliente 2', 'vainilla')
      
      expect(order1.id).toBe(1)
      expect(order2.id).toBe(2)
    })

    test('should set estimated delivery time', () => {
      const beforeCreate = new Date()
      const order = orderService.createOrder('Ana Ruiz', 'tres-leches')
      const afterCreate = new Date()
      
      const estimatedDelivery = new Date(order.estimatedDelivery)
      const createdAt = new Date(order.createdAt)
      
      expect(createdAt).toBeInstanceOf(Date)
      expect(estimatedDelivery).toBeInstanceOf(Date)
      expect(estimatedDelivery.getTime()).toBeGreaterThan(createdAt.getTime())
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime())
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime())
    })
  })

  describe('getAllOrders', () => {
    test('should return empty array when no orders', () => {
      const orders = orderService.getAllOrders()
      
      expect(Array.isArray(orders)).toBe(true)
      expect(orders.length).toBe(0)
    })

    test('should return all created orders', () => {
      orderService.createOrder('Cliente 1', 'chocolate')
      orderService.createOrder('Cliente 2', 'vainilla')
      
      const allOrders = orderService.getAllOrders()
      
      expect(allOrders.length).toBe(2)
      expect(allOrders[0].customer).toBe('Cliente 1')
      expect(allOrders[1].customer).toBe('Cliente 2')
    })
  })

  describe('updateOrderStatus', () => {
    test('should update order status successfully', () => {
      const order = orderService.createOrder('Carlos Mendez', 'red-velvet')
      
      const updatedOrder = orderService.updateOrderStatus(order.id, 'en vuelo')
      
      expect(updatedOrder.status).toBe('en vuelo')
      expect(updatedOrder.id).toBe(order.id)
    })

    test('should throw error for non-existent order', () => {
      expect(() => {
        orderService.updateOrderStatus(999, 'entregado')
      }).toThrow('Orden no encontrada')
    })

    test('should free drone when status is entregado', () => {
      const order = orderService.createOrder('Laura Torres', 'zanahoria')
      const assignedDroneId = order.droneId
      
      // Drone should be busy after order creation
      const busyDrone = drones.find(d => d.id === assignedDroneId)
      expect(busyDrone.available).toBe(false)
      
      // Update to delivered
      const deliveredOrder = orderService.updateOrderStatus(order.id, 'entregado')
      
      // Drone should be available again
      expect(busyDrone.available).toBe(true)
      expect(deliveredOrder.deliveredAt).toBeDefined()
    })
  })

  describe('completeOrder', () => {
    test('should complete order successfully', () => {
      const order = orderService.createOrder('Roberto Silva', 'chocolate')
      
      const completedOrder = orderService.completeOrder(order.id)
      
      expect(completedOrder.status).toBe('entregado')
      expect(completedOrder.deliveredAt).toBeDefined()
    })

    test('should free drone when completing order', () => {
      const order = orderService.createOrder('Carmen Vargas', 'vainilla')
      const droneId = order.droneId
      
      orderService.completeOrder(order.id)
      
      const freedDrone = drones.find(d => d.id === droneId)
      expect(freedDrone.available).toBe(true)
    })
  })
})