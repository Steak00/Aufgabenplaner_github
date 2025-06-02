describe('Task Creation with Fresh User', () => {
  it('registers a new user and creates a task', () => {
    // === Generate Random User ===
    const randomEmail = `user${Date.now()}@test.com`;
    const password = 'TestPassword123!';
    const firstName = 'Test';
    const lastName = 'User';

    // === Register New User ===
    cy.visit('/login');
    cy.contains('Registrieren').click();
    cy.get('#firstName').type(firstName);
    cy.get('#lastName').type(lastName);
    cy.get('#email').type(randomEmail);
    cy.get('#password').type(password);
    cy.get('#passwordRepeat').type(password);
    cy.get('#terms').check();
    cy.contains('button', 'Registrieren').click();

    // === After registration, redirected to login ===
    cy.url().should('include', '/login');

    // === Login with the new user ===
    cy.get('#email').type(randomEmail);
    cy.get('#password').type(password);
    cy.contains('button', 'Anmelden').click();
    cy.url().should('not.include', '/login');

    // === Create a Task ===
    cy.contains('Aufgaben').click();
    cy.contains('+ Neu').click();

    // Fill in the modal task form by targeting formControlName
    cy.get('input[formControlName="title"]').type('Meine neue Aufgabe');
    cy.get('textarea[formControlName="description"]').type('Dies ist die Beschreibung meiner Aufgabe');
    cy.get('select[formControlName="priority"]').select('Mittel'); // Selecting option text or value

    // Submit the task
    cy.contains('button', 'Erstellen').click();

    // ✅ Verify the task appears in the list
    cy.contains('Meine neue Aufgabe').should('exist');
  });
});
