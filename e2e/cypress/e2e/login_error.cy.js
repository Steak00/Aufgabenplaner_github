describe('Login error on wrong userdate', () => {
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

  
  // usefull if we have an error message
  it('should reject login with invalid credentials', () => {
    cy.get('input[name="email"]').type('wronguser');
    cy.get('input[name="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();

    cy.contains('Login fehlgeschlagen').should('be.visible'); 
  });
  
});
