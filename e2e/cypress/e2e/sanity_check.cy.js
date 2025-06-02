describe('Sanity Check', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the frontend and display the page title', () => {
    cy.contains('TaskIt'); // Adjust to match an element in your frontend
  });

  it('should have a login form visible', () => {
    cy.get('form').should('exist');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });
  
  it('should hit the backend health check', () => {
    cy.request('/api/login').its('status').should('eq', 200);
  });

});
