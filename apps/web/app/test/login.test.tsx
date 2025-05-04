import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { baseURL } from "app/lib/api/base";
import { renderWithProviders } from "app/test/utils";
import { http, HttpResponse } from "msw";
import { describe, expect, test, vi } from "vitest";
import Login from "~/routes/login";
import { testServer } from "./test.setup";

describe("Login", () => {
	test("renders when loading = true", async () => {
		const user = userEvent.setup();
		testServer.use(
			http.get(`${baseURL}/me`, () => {
				return HttpResponse.json(null);
			}),
			http.post(`${baseURL}/login`, () => {
				return HttpResponse.text("OK", { status: 200 });
			}),
		);

		renderWithProviders(<Login />);
		await waitFor(() => {
			expect(screen.queryByTestId("email-input")).toBeInTheDocument();
		});

		fireEvent.change(screen.getByTestId("email-input"), {
			target: { value: "test@test.com" },
		});
		await user.click(screen.getByTestId("login-button"));
	});
});
