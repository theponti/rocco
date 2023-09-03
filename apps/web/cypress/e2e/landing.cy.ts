describe("landing flow", () => {
  it("should load", () => {
    cy.visit("http://127.0.0.1:5001");
    cy.get("[data-testid='app-main']").should("be.visible");
  });
});
