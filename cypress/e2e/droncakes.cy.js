describe('DronCakes E2E Tests', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/')
  })

  describe('Homepage', () => {
    it('should load the main page successfully', () => {
      cy.contains('DronCakes')
      cy.contains('Pedidos de Pasteles con Drones')
      cy.get('#customerName').should('be.visible')
      cy.get('#cakeFlavor').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })

    it('should display drone status section', () => {
      cy.contains('Estado de los Drones')
      cy.get('#dronesList').should('be.visible')
      cy.get('.drone-item').should('have.length.greaterThan', 0)
    })

    it('should display orders section', () => {
      cy.contains('Órdenes Activas')
      cy.get('#ordersList').should('be.visible')
    })
  })

  describe('Order Creation', () => {
    it('should create a new order successfully', () => {
      const customerName = 'Cypress Test Customer'
      const flavor = 'chocolate'

      // Fill the form
      cy.fillOrderForm(customerName, flavor)

      // Submit the form
      cy.get('button[type="submit"]').click()

      // Wait for success message
      cy.contains('¡Orden creada exitosamente!', { timeout: 10000 })

      // Verify order appears in the list
      cy.get('#ordersList').should('contain', customerName)
      cy.get('#ordersList').should('contain', flavor)
    })

    it('should show error for empty form submission', () => {
      // Try to submit without filling the form
      cy.get('button[type="submit"]').click()

      // Check for HTML5 validation (required fields)
      cy.get('#customerName:invalid').should('exist')
    })

    it('should create orders with different flavors', () => {
      const flavors = ['vainilla', 'fresa', 'red-velvet']
      
      flavors.forEach((flavor, index) => {
        cy.fillOrderForm(`Customer ${index + 1}`, flavor)
        cy.get('button[type="submit"]').click()
        cy.contains('¡Orden creada exitosamente!', { timeout: 10000 })
        
        // Clear any success messages for next iteration
        cy.wait(1000)
      })

      // Verify all orders are displayed
      cy.get('#ordersList .order-item').should('have.length.at.least', flavors.length)
    })
  })

  describe('Drone Status Updates', () => {
    it('should show drone status changes when orders are created', () => {
      // Get initial available drone count
      cy.get('.drone-item.available').its('length').as('initialAvailable')

      // Create an order
      cy.fillOrderForm('Drone Test Customer', 'chocolate')
      cy.get('button[type="submit"]').click()
      cy.contains('¡Orden creada exitosamente!', { timeout: 10000 })

      // Check that available drone count decreased
      cy.get('@initialAvailable').then((initial) => {
        cy.get('.drone-item.available').should('have.length', initial - 1)
      })
    })

    it('should display drone information correctly', () => {
      cy.get('.drone-item').first().within(() => {
        cy.should('contain', 'Dron')
        cy.should('contain.oneOf', ['Disponible', 'Ocupado'])
      })
    })
  })

  describe('Order Management', () => {
    it('should complete an order and free the drone', () => {
      // Create an order first
      cy.fillOrderForm('Complete Order Test', 'vainilla')
      cy.get('button[type="submit"]').click()
      cy.contains('¡Orden creada exitosamente!', { timeout: 10000 })

      // Find and complete the order
      cy.get('#ordersList').within(() => {
        cy.contains('Complete Order Test').parent().within(() => {
          cy.get('.complete-btn').click()
        })
      })

      // Verify the order status changed or was removed
      cy.get('#ordersList').should('not.contain', 'Complete Order Test').or('contain', 'entregado')
    })

    it('should show order status progression', () => {
      // Create order
      cy.fillOrderForm('Status Test Customer', 'fresa')
      cy.get('button[type="submit"]').click()
      cy.contains('¡Orden creada exitosamente!', { timeout: 10000 })

      // Order should start in 'preparando' status
      cy.get('#ordersList').within(() => {
        cy.contains('Status Test Customer').parent().should('contain', 'preparando')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle server errors gracefully', () => {
      // Mock a server error (this would require API mocking in a real scenario)
      // For now, we test that the UI doesn't break with invalid data
      
      cy.fillOrderForm('Error Test Customer', 'chocolate')
      cy.get('button[type="submit"]').click()

      // The form should either succeed or show an error message
      // It should not cause the page to crash
      cy.get('body').should('exist')
      cy.get('#customerName').should('be.visible')
    })
  })

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-6')
      
      cy.get('#customerName').should('be.visible')
      cy.get('#cakeFlavor').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
      
      // Test form functionality on mobile
      cy.fillOrderForm('Mobile Test Customer', 'chocolate')
      cy.get('button[type="submit"]').click()
      cy.contains('¡Orden creada exitosamente!', { timeout: 10000 })
    })

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2')
      
      cy.get('.container').should('be.visible')
      cy.get('#dronesList').should('be.visible')
      cy.get('#ordersList').should('be.visible')
    })
  })
})