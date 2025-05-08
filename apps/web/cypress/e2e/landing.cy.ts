describe("landing flow", () => {
	it("should load", () => {
		cy.visit("http://localhost:3000");
		cy.contains("All in one place.").should("be.visible");
	});
});
