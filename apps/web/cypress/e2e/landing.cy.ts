describe("landing flow", () => {
  test("should load", () => {
    cy.visit("http://localhost:53422");
    cy.contains("Make the world yours").should("be.visible");
  });
});
