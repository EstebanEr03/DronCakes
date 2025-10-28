import { describe, test, expect, beforeEach } from '@jest/globals'
import * as droneService from '../../src/services/droneService.js'
import { drones } from '../../src/utils/dataStore.js'

describe('Drone Service - Unit Tests', () => {
  beforeEach(() => {
    // Reset drone state before each test
    drones.forEach(drone => {
      drone.available = drone.id !== 3 // SweetFly starts as unavailable
    })
  })

  describe('getAllDrones', () => {
    test('should return all drones', () => {
      const drones = droneService.getAllDrones()
      
      expect(drones).toBeDefined()
      expect(Array.isArray(drones)).toBe(true)
      expect(drones.length).toBeGreaterThan(0)
    })

    test('should return drones with correct structure', () => {
      const drones = droneService.getAllDrones()
      
      drones.forEach(drone => {
        expect(drone).toHaveProperty('id')
        expect(drone).toHaveProperty('name')
        expect(drone).toHaveProperty('available')
        expect(typeof drone.id).toBe('number')
        expect(typeof drone.name).toBe('string')
        expect(typeof drone.available).toBe('boolean')
      })
    })
  })

  describe('updateDroneStatus', () => {
    test('should update drone availability successfully', () => {
      const droneId = 1
      const newStatus = false
      
      const updatedDrone = droneService.updateDroneStatus(droneId, newStatus)
      
      expect(updatedDrone).toBeDefined()
      expect(updatedDrone.id).toBe(droneId)
      expect(updatedDrone.available).toBe(newStatus)
    })

    test('should throw error for non-existent drone', () => {
      const nonExistentId = 999
      
      expect(() => {
        droneService.updateDroneStatus(nonExistentId, true)
      }).toThrow('Dron no encontrado')
    })

    test('should handle string drone id', () => {
      const droneId = '2'
      const newStatus = true
      
      const updatedDrone = droneService.updateDroneStatus(droneId, newStatus)
      
      expect(updatedDrone).toBeDefined()
      expect(updatedDrone.id).toBe(2)
      expect(updatedDrone.available).toBe(newStatus)
    })

    test('should maintain drone data integrity', () => {
      const droneId = 1
      const originalDrones = droneService.getAllDrones()
      const originalDrone = originalDrones.find(d => d.id === droneId)
      const originalName = originalDrone.name
      
      droneService.updateDroneStatus(droneId, false)
      
      const updatedDrones = droneService.getAllDrones()
      const updatedDrone = updatedDrones.find(d => d.id === droneId)
      
      expect(updatedDrone.name).toBe(originalName)
      expect(updatedDrone.id).toBe(droneId)
    })
  })
})