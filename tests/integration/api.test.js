const { describe, test, expect } = require('@jest/globals')

// Integration tests for DronCakes business logic
// These tests verify that different modules work together correctly
describe('Integration Tests - Business Logic', () => {
  // Import services using require (CommonJS)
  const droneService = require('../../src/services/droneService.js')
  const orderService = require('../../src/services/orderService.js')
  const dataStore = require('../../src/utils/dataStore.js')
  
  test('should complete order workflow from creation to delivery', () => {
    // Reset data store for clean test
    dataStore.reset()
    
    // 1. Check initial drone availability
    const initialDrones = droneService.getAllDrones()
    const availableDrones = initialDrones.filter(drone => drone.available)
    expect(availableDrones.length).toBeGreaterThan(0)
    
    // 2. Create a new order
    const orderData = {
      customer: 'Integration Test Customer',
      flavor: 'chocolate'
    }
    
    const newOrder = orderService.createOrder(orderData)
    expect(newOrder).toBeTruthy()
    expect(newOrder.id).toBeDefined()
    expect(newOrder.customer).toBe(orderData.customer)
    expect(newOrder.flavor).toBe(orderData.flavor)
    expect(newOrder.status).toBe('preparando')
    expect(newOrder.droneId).toBeDefined()
    
    // 3. Verify drone was assigned and marked as busy
    const dronesAfterOrder = droneService.getAllDrones()
    const assignedDrone = dronesAfterOrder.find(d => d.id === newOrder.droneId)
    expect(assignedDrone).toBeTruthy()
    expect(assignedDrone.available).toBe(false)
    
    const availableAfterOrder = dronesAfterOrder.filter(d => d.available)
    expect(availableAfterOrder.length).toBe(availableDrones.length - 1)
    
    // 4. Update order status to 'en vuelo'
    const updatedOrder = orderService.updateOrderStatus(newOrder.id, 'en vuelo')
    expect(updatedOrder.status).toBe('en vuelo')
    
    // 5. Complete the order
    const completedOrder = orderService.completeOrder(newOrder.id)
    expect(completedOrder.status).toBe('entregado')
    expect(completedOrder.deliveredAt).toBeDefined()
    
    // 6. Verify drone was freed
    const dronesAfterComplete = droneService.getAllDrones()
    const freedDrone = dronesAfterComplete.find(d => d.id === newOrder.droneId)
    expect(freedDrone.available).toBe(true)
    
    const availableAfterComplete = dronesAfterComplete.filter(d => d.available)
    expect(availableAfterComplete.length).toBe(availableDrones.length)
  })
  
  test('should handle multiple concurrent orders', () => {
    // Reset for clean test
    dataStore.reset()
    
    const initialDrones = droneService.getAllDrones()
    const availableCount = initialDrones.filter(d => d.available).length
    
    // Create multiple orders
    const orders = []
    const orderCount = Math.min(3, availableCount) // Don't exceed available drones
    
    for (let i = 0; i < orderCount; i++) {
      const order = orderService.createOrder({
        customer: `Customer ${i + 1}`,
        flavor: ['chocolate', 'vainilla', 'fresa'][i % 3]
      })
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
  
  test('should handle order status transitions correctly', () => {
    dataStore.reset()
    
    // Create order
    const order = orderService.createOrder({
      customer: 'Status Test Customer',
      flavor: 'red-velvet'
    })
    
    // Test status progression
    expect(order.status).toBe('preparando')
    
    // Update to 'en vuelo'
    let updatedOrder = orderService.updateOrderStatus(order.id, 'en vuelo')
    expect(updatedOrder.status).toBe('en vuelo')
    
    // Try invalid status (should not change)
    try {
      orderService.updateOrderStatus(order.id, 'invalid-status')
    } catch (error) {
      expect(error).toBeTruthy()
    }
    
    // Status should remain 'en vuelo'
    const currentOrder = orderService.getOrderById(order.id)
    expect(currentOrder.status).toBe('en vuelo')
    
    // Complete order
    const completedOrder = orderService.completeOrder(order.id)
    expect(completedOrder.status).toBe('entregado')
  })
  
  test('should handle drone capacity limits', () => {
    dataStore.reset()
    
    const allDrones = droneService.getAllDrones()
    const droneCount = allDrones.length
    
    // Create orders equal to drone count
    const orders = []
    for (let i = 0; i < droneCount; i++) {
      const order = orderService.createOrder({
        customer: `Capacity Test Customer ${i + 1}`,
        flavor: 'chocolate'
      })
      orders.push(order)
    }
    
    // All drones should now be busy
    const busyDrones = droneService.getAllDrones().filter(d => !d.available)
    expect(busyDrones.length).toBe(droneCount)
    
    // Try to create one more order (should fail or queue)
    try {
      const extraOrder = orderService.createOrder({
        customer: 'Extra Customer',
        flavor: 'vainilla'
      })
      
      // If it succeeds, there should be some queuing mechanism
      // For now, we expect it to fail since we don't have queuing implemented
      expect(extraOrder).toBeFalsy()
    } catch (error) {
      // This is expected behavior when no drones are available
      expect(error.message).toContain('drones disponibles')
    }
  })
  
  test('should maintain data consistency across operations', () => {
    dataStore.reset()
    
    // Test data store consistency
    const initialOrders = orderService.getAllOrders()
    const initialDrones = droneService.getAllDrones()
    
    expect(Array.isArray(initialOrders)).toBe(true)
    expect(Array.isArray(initialDrones)).toBe(true)
    expect(initialDrones.length).toBeGreaterThan(0)
    
    // Create and complete an order
    const order = orderService.createOrder({
      customer: 'Consistency Test',
      flavor: 'chocolate'
    })
    
    const ordersAfterCreate = orderService.getAllOrders()
    expect(ordersAfterCreate.length).toBe(initialOrders.length + 1)
    
    // Complete order
    orderService.completeOrder(order.id)
    
    // Data should still be consistent
    const ordersAfterComplete = orderService.getAllOrders()
    const dronesAfterComplete = droneService.getAllDrones()
    
    expect(ordersAfterComplete.length).toBe(initialOrders.length + 1)
    expect(dronesAfterComplete.length).toBe(initialDrones.length)
    
    // Find the completed order
    const completedOrder = ordersAfterComplete.find(o => o.id === order.id)
    expect(completedOrder.status).toBe('entregado')
    expect(completedOrder.deliveredAt).toBeDefined()
  })
})