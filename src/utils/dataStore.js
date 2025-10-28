export const drones = [
  { id: 1, name: 'Droncito 1', available: true },
  { id: 2, name: 'PastelExpress', available: true },
  { id: 3, name: 'SweetFly', available: false }
]

export const orders = []

// Reset function for testing
export const reset = () => {
  // Reset drones to initial state
  drones.length = 0
  drones.push(
    { id: 1, name: 'Droncito 1', available: true },
    { id: 2, name: 'PastelExpress', available: true },
    { id: 3, name: 'SweetFly', available: true } // Set all to available for tests
  )

  // Clear orders
  orders.length = 0
}
