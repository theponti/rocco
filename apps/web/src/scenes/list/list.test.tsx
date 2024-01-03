import { act, fireEvent, screen } from "@testing-library/react";
import { useParams, useNavigate } from "react-router-dom";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  Mock,
  test,
  vi,
} from "vitest";

import { renderWithProviders } from "src/test/utils";
import List from ".";

describe("List", () => {
  beforeEach(() => {
    (useParams as Mock).mockReturnValue({ id: "list-id" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("it should navigate to home page if no user", () => {
    const navigate = vi.fn();
    (useNavigate as Mock).mockReturnValue(navigate);
    renderWithProviders(<List />);
    expect(useParams).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith("/");
  });

  describe("delete list item", () => {
    test("should make DELETE API request on enter click", async () => {
      renderWithProviders(<List />, { isAuth: true });
      const deleteButton = screen.getByTestId("delete-place-button");

      await act(async () => {
        fireEvent.keyDown(deleteButton, { key: "Enter", code: "Enter" });
      });

      // expect(screen.getByText("test place")).not.toBeInTheDocument();
    });

    test("should make DELETE API request on button click", async () => {
      renderWithProviders(<List />, { isAuth: true });
      const deleteButton = screen.getByTestId("delete-place-button");

      await act(async () => {
        fireEvent.click(deleteButton);
      });

      // expect(screen.getByText("test place")).not.toBeInTheDocument();
    });
  });
});
