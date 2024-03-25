import { test, expect } from "vitest";
import Home from ".";
import { renderWithProviders } from "src/test/utils";
import { screen } from "@testing-library/react";

describe("Home", () => {
  test("renders", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Make the world yours.")).toBeInTheDocument();
  });
});
