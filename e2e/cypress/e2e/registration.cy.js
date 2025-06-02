describe('User Registration and Login', () => {
  it('registers a new user and logs in', () => {
    // Generate random user data
    const randomEmail = `user${Date.now()}@test.com`;
    const password = 'TestPassword123!';
    const firstName = 'Test';
    const lastName = 'User';

    // Visit the login page
    cy.visit('/login');

    // Click "Registrieren" link
    cy.contains('Registrieren').click();

    // Fill in the registration form
    cy.get('#firstName').type(firstName);
    cy.get('#lastName').type(lastName);
    cy.get('#email').type(randomEmail);
    cy.get('#password').type(password);
    cy.get('#passwordRepeat').type(password);

    // Check AGB checkbox
    cy.get('#terms').check();

    // Submit registration
    cy.contains('button', 'Registrieren').click();

    // After registration, land back on the login page
    cy.url().should('include', '/login');

    // Fill in the login form
    cy.get('#email').type(randomEmail);
    cy.get('#password').type(password);

    // Click the "Anmelden" button
    cy.contains('button', 'Anmelden').click();

    // Verify successful login
    cy.url().should('include', '/dashboard');
  });
});
