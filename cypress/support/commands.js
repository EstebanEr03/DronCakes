// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to create an order via API
Cypress.Commands.add('createOrder', (orderData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/orders`,
    body: orderData
  }).then((response) => {
    expect(response.status).to.eq(201)
    return cy.wrap(response.body)
  })
})

// Custom command to get all drones
Cypress.Commands.add('getDrones', () => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/drones`
  }).then((response) => {
    expect(response.status).to.eq(200)
    return cy.wrap(response.body)
  })
})

// Custom command to wait for element and click
Cypress.Commands.add('waitAndClick', (selector) => {
  cy.get(selector).should('be.visible').click()
})

// Custom command to fill form
Cypress.Commands.add('fillOrderForm', (customer, flavor) => {
  cy.get('#customerName').clear().type(customer)
  cy.get('#cakeFlavor').select(flavor)
})