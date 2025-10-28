const { describe, test, expect, beforeEach, afterAll } = require('@jest/globals')

// Integration tests for DronCakes business logic
// These tests verify that different modules work together correctly
describe('Integration Tests - Business Logic', () => {
  // Import services using require (CommonJS)
  const droneService = require('../../src/services/droneService.js')
  const orderService = require('../../src/services/orderService.js')
  const dataStore = require('../../src/utils/dataStore.js')
  
  // Clear timeouts after all tests to prevent async issues
  const activeTimeouts = []
  const originalSetTimeout = global.setTimeout
  
  beforeEach(() => {
    // Reset data store for clean test
    dataStore.reset()
    
    // Mock setTimeout to prevent async operations during tests
    global.setTimeout = (fn, delay) => {
      const timeoutId = originalSetTimeout(() => {
        // Don't execute timeouts during tests
      }, delay)
      activeTimeouts.push(timeoutId)
      return timeoutId
    }
  })
  
  afterAll(() => {
    // Restore original setTimeout
    global.setTimeout = originalSetTimeout
    
    // Clear any remaining timeouts
    activeTimeouts.forEach(clearTimeout)
  })
  
  test('should verify drone service functionality', () => {
    // Test drone service basic functionality
    const allDrones = droneService.getAllDrones()
    expect(Array.isArray(allDrones)).toBe(true)
    expect(allDrones.length).toBeGreaterThan(0)
    
    // Check drone structure
    allDrones.forEach(drone => {
      expect(drone).toHaveProperty('id')
      expect(drone).toHaveProperty('name')
      expect(drone).toHaveProperty('available')
    })
    
    // Test drone status update
    const firstDrone = allDrones[0]
    const originalStatus = firstDrone.available
    
    const updatedDrone = droneService.updateDroneStatus(firstDrone.id, !originalStatus)
    expect(updatedDrone.available).toBe(!originalStatus)
  })
  
  test('should create and manage orders correctly', () => {
    // Get initial state
    const initialOrders = orderService.getAllOrders()
    const initialDrones = droneService.getAllDrones()
    const availableDrones = initialDrones.filter(d => d.available)
    
    expect(initialOrders.length).toBe(0) // Should start empty after reset
    expect(availableDrones.length).toBeGreaterThan(0)
    
    // Create an order using correct parameter format
    const newOrder = orderService.createOrder('Integration Test Customer', 'chocolate')
    
    // Verify order was created
    expect(newOrder).toBeTruthy()
    expect(newOrder.id).toBeDefined()
    expect(newOrder.customer).toBe('Integration Test Customer')
    expect(newOrder.flavor).toBe('chocolate')
    expect(newOrder.status).toBe('preparando')
    expect(newOrder.droneId).toBeDefined()
    expect(newOrder.drone).toBeDefined()
    
    // Verify order was added to the list
    const allOrders = orderService.getAllOrders()
    expect(allOrders.length).toBe(1)
    expect(allOrders[0].id).toBe(newOrder.id)
    
    // Verify drone was marked as busy
    const dronesAfterOrder = droneService.getAllDrones()
    const assignedDrone = dronesAfterOrder.find(d => d.id === newOrder.droneId)
    expect(assignedDrone.available).toBe(false)
  })
  
  test('should handle order status updates', () => {
    // Create an order
    const order = orderService.createOrder('Status Test Customer', 'vainilla')
    expect(order.status).toBe('preparando')
    
    // Update order status
    const updatedOrder = orderService.updateOrderStatus(order.id, 'en vuelo')
    expect(updatedOrder.status).toBe('en vuelo')
    
    // Verify the status persists
    const allOrders = orderService.getAllOrders()
    const foundOrder = allOrders.find(o => o.id === order.id)
    expect(foundOrder.status).toBe('en vuelo')
  })
  
  test('should complete orders and free drones', () => {
    // Create order
    const order = orderService.createOrder('Complete Test Customer', 'fresa')
    
    // Verify drone is busy
    const busyDrone = droneService.getAllDrones().find(d => d.id === order.droneId)
    expect(busyDrone.available).toBe(false)
    
    // Complete the order
    const completedOrder = orderService.completeOrder(order.id)
    expect(completedOrder.status).toBe('entregado')
    expect(completedOrder.deliveredAt).toBeDefined()
    
    // Verify drone was freed
    const freedDrone = droneService.getAllDrones().find(d => d.id === order.droneId)
    expect(freedDrone.available).toBe(true)
  })
  
  test('should handle multiple concurrent orders', () => {
    const initialDrones = droneService.getAllDrones()
    const availableCount = initialDrones.filter(d => d.available).length
    
    // Create multiple orders (but not more than available drones)
    const orders = []
    const orderCount = Math.min(2, availableCount)
    
    for (let i = 0; i < orderCount; i++) {
      const order = orderService.createOrder(
        `Customer ${i + 1}`,
        ['chocolate', 'vainilla'][i % 2]
      )
      orders.push(order)
    }
    
    // Verify all orders were created
    expect(orders.length).toBe(orderCount)
    
    // Verify each order has a unique drone
    const assignedDroneIds = orders.map(order => order.droneId)
    const uniqueDroneIds = [...new Set(assignedDroneIds)]
    expect(uniqueDroneIds.length).toBe(orderCount)
    
    // Verify correct number of drones are now busy
    const dronesAfterOrders = droneService.getAllDrones()
    const busyDrones = dronesAfterOrders.filter(d => !d.available)
    expect(busyDrones.length).toBe(orderCount)
    
    // Complete all orders
    orders.forEach(order => {
      orderService.completeOrder(order.id)
    })
    
    // Verify all drones are available again
    const dronesAfterCompletion = droneService.getAllDrones()
    const availableAfterCompletion = dronesAfterCompletion.filter(d => d.available)
    expect(availableAfterCompletion.length).toBe(availableCount)
  })
  
  test('should handle drone capacity limits', () => {
    const allDrones = droneService.getAllDrones()
    const availableDrones = allDrones.filter(d => d.available)
    const droneCount = availableDrones.length
    
    // Create orders equal to available drone count
    const orders = []
    for (let i = 0; i < droneCount; i++) {
      const order = orderService.createOrder(
        `Capacity Test Customer ${i + 1}`,
        'chocolate'
      )
      orders.push(order)
    }
    
    // All drones should now be busy
    const busyDrones = droneService.getAllDrones().filter(d => !d.available)
    expect(busyDrones.length).toBe(droneCount)
    
    // Try to create one more order (should fail)
    expect(() => {
      orderService.createOrder('Extra Customer', 'vainilla')
    }).toThrow('No hay drones disponibles')
  })
  
  test('should maintain data consistency across operations', () => {
    // Test data integrity
    const initialOrders = orderService.getAllOrders()
    const initialDrones = droneService.getAllDrones()
    
    expect(Array.isArray(initialOrders)).toBe(true)
    expect(Array.isArray(initialDrones)).toBe(true)
    expect(initialDrones.length).toBe(3) // We know we have 3 drones from dataStore
    
    // Create and complete an order
    const order = orderService.createOrder('Consistency Test', 'red-velvet')
    
    const ordersAfterCreate = orderService.getAllOrders()
    expect(ordersAfterCreate.length).toBe(1)
    
    // Complete order
    const completedOrder = orderService.completeOrder(order.id)
    
    // Data should still be consistent
    const ordersAfterComplete = orderService.getAllOrders()
    const dronesAfterComplete = droneService.getAllDrones()
    
    expect(ordersAfterComplete.length).toBe(1) // Order still exists, just completed
    expect(dronesAfterComplete.length).toBe(3) // Same number of drones
    
    // Verify the order is completed
    expect(completedOrder.status).toBe('entregado')
    expect(completedOrder.deliveredAt).toBeDefined()
  })
})